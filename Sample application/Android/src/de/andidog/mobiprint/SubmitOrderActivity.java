package de.andidog.mobiprint;

import android.app.Activity;
import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.EditText;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;

public class SubmitOrderActivity extends Activity
{
    private OrderCollectionAdapter adapter;

    private String currentLocation = null;

    private EditText locationEditText;

    private LocationListener locationListener;

    private static final String TAG = "SubmitOrderActivity";

    private void addLocationRadioButton(final Store location)
    {
        final int id = location.getId();
        final RadioGroup locations = (RadioGroup)findViewById(R.id.locations);

        LayoutInflater inflater = (LayoutInflater)getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View locationLayout = inflater.inflate(R.layout.location, null);

        RadioButton radioButton = (RadioButton)locationLayout.findViewById(R.id.select_location);
        radioButton.setId(id);
        TextView nameTextView = (TextView)locationLayout.findViewById(R.id.location_name);
        nameTextView.setText(location.getName());
        nameTextView.setClickable(false);
        TextView addressTextView = (TextView)locationLayout.findViewById(R.id.location_address);
        addressTextView.setText(location.getAddress());
        addressTextView.setClickable(false);

        locationLayout.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v)
            {
                // Note: View ID is set to location ID
                locations.check(id);
            }
        });

        locations.addView(locationLayout);
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

        addLocationRadioButton(new Store(1, "LITTLE", "somewhere"));
        addLocationRadioButton(new Store(2, "F-Markt", "somewhere else"));

        startLocating();
    }

    private synchronized void setCurrentLocation(String currentLocation)
    {
        boolean initial = this.currentLocation == null;
        this.currentLocation = currentLocation.trim();

        if(initial || !locationEditText.getText().toString().equals(this.currentLocation))
        {
            locationEditText.setText(this.currentLocation);
            updateStores();
        }
    }

    private void setCurrentLocation(Location location)
    {
        setCurrentLocation(String.format("%.5f;%.5f", location.getLatitude(), location.getLongitude()));
    }

    private void startLocating()
    {
        final LocationManager locationManager = (LocationManager)this.getSystemService(Context.LOCATION_SERVICE);

        locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(Location location)
            {
                Log.i(TAG, "Found coarse location");
                setCurrentLocation(location);
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
        if(cachedLocation != null && System.currentTimeMillis() - cachedLocation.getTime() < 86400000)
            setCurrentLocation(cachedLocation);

        locationManager.requestSingleUpdate(LocationManager.GPS_PROVIDER, locationListener, null);
        locationManager.requestSingleUpdate(LocationManager.NETWORK_PROVIDER, locationListener, null);
    }

    private void updateStores()
    {
        Log.i("STORES", "Updating stores from location " + currentLocation);
    }
}
