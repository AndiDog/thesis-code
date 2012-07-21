package de.andidog.mobiprint;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

public class SubmitOrderActivity extends Activity
{
    private OrderCollectionAdapter adapter;

    private String currentLocation = null;

    private DownloadStoresTask downloadStoresTask = null;

    private EditText locationEditText;

    private LocationListener locationListener;

    private List<RadioButton> radioButtons = new ArrayList<RadioButton>();

    private static final String TAG = "SubmitOrderActivity";

    private void addLocationRadioButton(final Store location)
    {
        final int id = location.getId();
        final RadioGroup locations = (RadioGroup)findViewById(R.id.locations);

        LayoutInflater inflater = (LayoutInflater)getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View locationLayout = inflater.inflate(R.layout.location, null);

        RadioButton radioButton = (RadioButton)locationLayout.findViewById(R.id.select_location);
        radioButton.setId(id);
        radioButtons.add(radioButton);

        TextView nameTextView = (TextView)locationLayout.findViewById(R.id.location_name);
        nameTextView.setText(location.getName());
        nameTextView.setClickable(false);
        TextView addressTextView = (TextView)locationLayout.findViewById(R.id.location_address);
        addressTextView.setText(location.getAddress());
        addressTextView.setClickable(false);

        OnClickListener radioButtonOnClickListener = new OnClickListener() {
            @Override
            public void onClick(View v)
            {
                // RadioGroup.check does not work because we don't use RadioButtons directly as child views
                for(RadioButton radioButton : radioButtons)
                    radioButton.setChecked(radioButton.getId() == id);
            }
        };

        radioButton.setOnClickListener(radioButtonOnClickListener);
        locationLayout.setOnClickListener(radioButtonOnClickListener);

        locations.addView(locationLayout);
    }

    /**
     * @return May return NULL.
     */
    private String getCachedLocation()
    {
        File cacheDir = getCacheDir();
        File cachedFile = new File(cacheDir.getAbsolutePath(), "location.txt");
        FileInputStream stream = null;
        InputStreamReader in = null;

        try
        {
            if(cachedFile.exists() && cachedFile.length() > 5)
            {
                stream = new FileInputStream(cachedFile);
                in = new InputStreamReader(stream);

                // Fair enough :D
                char[] buffer = new char[(int)cachedFile.length()*4];
                int len = in.read(buffer, 0, buffer.length);
                return String.valueOf(buffer, 0, len).trim();
            }
        }
        catch(IOException e)
        {
            e.printStackTrace();
            Toast.makeText(this, "Failed to read cached location: " + e, Toast.LENGTH_LONG).show();
        }
        finally
        {
            try
            {
                if(in != null)
                    in.close();
                if(stream != null)
                    stream.close();
            }
            catch(IOException e)
            {
            }
        }

        return null;
    }

    private String locationToString(Location location)
    {
        if(location == null)
            return null;

        return String.format("%.5f;%.5f", location.getLatitude(), location.getLongitude());
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.submit_order);

        locationEditText = (EditText)findViewById(R.id.location_edit);

        adapter = OrderCollectionAdapter.getInstance(this);

        Order currentOrder = null;

        for(Order order : adapter.getAllOrders())
            if(order.getSubmissionDate() == null)
            {
                currentOrder = order;
                break;
            }

        if(currentOrder == null)
            throw new AssertionError();

        TextView heading = (TextView)findViewById(R.id.submit_heading);
        heading.setText(String.format(getResources().getString(R.string.submit_heading_fmt),
                                      currentOrder.getPictureIds().length));

        Button submitButton = (Button)findViewById(R.id.submit_order_button);
        submitButton.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v)
            {
                onSubmitOrderButtonClick();
            }
        });

        startLocating();

        new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params)
            {
                try
                {
                    Thread.sleep(500);
                }
                catch(InterruptedException e)
                {
                }

                return null;
            }

            @Override
            protected void onPostExecute(Void result)
            {
                locationEditText.addTextChangedListener(new TextWatcher() {
                    @Override
                    public void afterTextChanged(Editable s)
                    {
                    }

                    @Override
                    public void beforeTextChanged(CharSequence s, int start, int count, int after)
                    {
                    }

                    @Override
                    public void onTextChanged(CharSequence s, int start, int before, int count)
                    {
                        setCurrentLocation(s.toString());
                    }
                });
            }
        }.execute();
    }

    private void onSubmitOrderButtonClick()
    {
        CheckBox confirmCheckbox = (CheckBox)findViewById(R.id.confirm_order);
        EditText usernameEditText = (EditText)findViewById(R.id.username);
        EditText passwordEditText = (EditText)findViewById(R.id.password);

        Integer storeId = null;
        String username = usernameEditText.getText().toString();
        String password = passwordEditText.getText().toString();

        for(RadioButton radioButton : radioButtons)
            if(radioButton.isChecked())
            {
                storeId = radioButton.getId();
                break;
            }

        String error = null;

        if(username.length() == 0 || password.length() == 0)
            error = getResources().getString(R.string.must_enter_credentials);
        else if(storeId == null)
            error = getResources().getString(R.string.must_select_store);
        else if(!confirmCheckbox.isChecked())
            error = getResources().getString(R.string.must_confirm_order);

        if(error != null)
            Toast.makeText(this, error, Toast.LENGTH_LONG).show();
        else
        {
            Order currentOrder = null;

            for(Order order : adapter.getAllOrders())
                if(order.getSubmissionDate() == null)
                {
                    currentOrder = order;
                    break;
                }

            if(currentOrder == null)
                throw new AssertionError();

            new SubmitOrderTask(this, currentOrder.getId(), storeId, username, password) {
                @Override
                protected void onPostExecute(Void result)
                {
                    super.onPostExecute(result);

                    if(error != null)
                        return;

                    finish();

                    // Reload list of orders
                    OldOrdersActivity.getInstance().triggerFullRefresh();

                    TabsActivity.getInstance().getTabHost().setCurrentTab(0);
                    Toast.makeText(context, R.string.order_submitted, Toast.LENGTH_LONG).show();
                }
            }.execute();
        }
    }

    private synchronized void setCurrentLocation(String currentLocation)
    {
        boolean initial = this.currentLocation == null;
        String previousLocation = this.currentLocation;
        this.currentLocation = currentLocation.trim();

        if(initial || !previousLocation.equals(this.currentLocation))
        {
            if(!locationEditText.getText().toString().trim().equals(this.currentLocation))
                locationEditText.setText(this.currentLocation);

            updateStores();

            if(this.currentLocation.length() > 0)
            {
                File cacheDir = getCacheDir();
                File cachedFile = new File(cacheDir.getAbsolutePath(), "location.txt");
                FileOutputStream stream = null;

                try
                {
                    stream = new FileOutputStream(cachedFile);
                    stream.write(this.currentLocation.getBytes());
                }
                catch(IOException e)
                {
                    e.printStackTrace();
                    Toast.makeText(this, "Failed to store cached location: " + e, Toast.LENGTH_LONG).show();

                    try
                    {
                        if(stream != null)
                            stream.close();
                    }
                    catch(IOException e2)
                    {
                        e2.printStackTrace();
                    }
                }
            }
        }
    }

    private void startLocating()
    {
        final LocationManager locationManager = (LocationManager)this.getSystemService(Context.LOCATION_SERVICE);

        locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(Location location)
            {
                Log.i(TAG, "Found coarse location");
                setCurrentLocation(locationToString(location));
                locationManager.removeUpdates(locationListener);
            }

            @Override
            public void onProviderDisabled(String provider)
            {
            }

            @Override
            public void onProviderEnabled(String provider)
            {
            }

            @Override
            public void onStatusChanged(String provider, int status, Bundle extras)
            {
            }
        };

        new Thread(new Runnable() {
            public void run()
            {
                // Wait 30 seconds at the most for first location update
                try
                {
                    Thread.sleep(30000);
                }
                catch(InterruptedException e)
                {
                }

                locationManager.removeUpdates(locationListener);
            }
        }).start();

        Location cachedLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
        if(cachedLocation == null)
            cachedLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);

        String cachedLocationStr;

        if(cachedLocation != null && System.currentTimeMillis() - cachedLocation.getTime() > 1000 * 120)
            cachedLocationStr = getCachedLocation();
        else
            cachedLocationStr = locationToString(cachedLocation);

        setCurrentLocation(cachedLocationStr == null ? "" : cachedLocationStr);

        locationManager.requestSingleUpdate(LocationManager.GPS_PROVIDER, locationListener, null);
        locationManager.requestSingleUpdate(LocationManager.NETWORK_PROVIDER, locationListener, null);
    }

    private synchronized void updateStores()
    {
        if(downloadStoresTask != null)
            downloadStoresTask.cancel();

        Log.i("STORES", "Updating stores from location " + currentLocation);
        downloadStoresTask = (DownloadStoresTask)new DownloadStoresTask(this) {
            @Override
            protected void onPostExecute(JSONArray result)
            {
                super.onPostExecute(result);

                if(result == null)
                    return;

                final RadioGroup locations = (RadioGroup)findViewById(R.id.locations);
                locations.removeAllViews();
                radioButtons.clear();

                for(int i = 0; i < result.length() && i < 5; ++i)
                {
                    JSONObject storeJson;
                    try
                    {
                        storeJson = result.getJSONObject(i);
                        addLocationRadioButton(new Store(storeJson.getInt("id"),
                                                         storeJson.getString("name"),
                                                         storeJson.getString("address")));
                    }
                    catch(JSONException e)
                    {
                        e.printStackTrace();
                        Toast.makeText(context, "Stores JSON invalid", Toast.LENGTH_LONG).show();
                    }
                }
            };
        }.execute(currentLocation);
    }
}
