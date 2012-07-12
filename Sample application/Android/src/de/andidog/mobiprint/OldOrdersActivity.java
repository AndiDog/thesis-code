package de.andidog.mobiprint;

import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONObject;

import android.app.ListActivity;
import android.database.DataSetObserver;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

public class OldOrdersActivity extends ListActivity
{
    private OrderCollectionAdapter adapter;

    private static OldOrdersActivity instance;

    private int lastOrdersHashCode = -1;

    private TextView heading;

    public static OldOrdersActivity getInstance()
    {
        return instance;
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.old_orders);

        heading = (TextView)findViewById(R.id.orders_list_heading);

        adapter = OrderCollectionAdapter.getInstance(this);
        setListAdapter(adapter);

        refresh(true, false);
        refresh(false, false);

        PictureUploadTask.registerObserver(new DataSetObserver() {
            @Override
            public void onChanged()
            {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run()
                    {
                        refresh(false, true);
                    }
                });
            }
        });
    }

    private void refresh(boolean forceUseCache, boolean forceRequest)
    {
        final boolean forceUseCache_ = forceUseCache;
        final boolean forceRequest_ = forceRequest;

        DownloadOldOrdersTask task = new DownloadOldOrdersTask(this, forceUseCache, forceRequest) {
            @Override
            protected void onPostExecute(JSONArray result)
            {
                if(!forceUseCache_ && !forceRequest_)
                {
                    Thread th = new Thread(new Runnable() {
                        public void run() {
                            try
                            {
                                Thread.sleep(60000);
                            }
                            catch(InterruptedException e)
                            {
                            }

                            refresh(false, false);
                        };
                    });

                    th.setDaemon(true);
                    th.start();
                }

                super.onPostExecute(result);

                if(result == null)
                    return;

                try
                {
                    int ordersHashCode = 0;

                    ArrayList<Order> newOrders = new ArrayList<Order>();

                    for(int i = 0; i < result.length(); ++i)
                    {
                        JSONObject orderJson = result.getJSONObject(i);

                        Order order = new Order();
                        order.setId(orderJson.getInt("id"));

                        if(!orderJson.has("storeId") || orderJson.isNull("storeId"))
                            order.setStoreId(null);
                        else
                            order.setStoreId(orderJson.getInt("storeId"));

                        if(orderJson.isNull("submissionDate"))
                            order.setSubmissionDate(null);
                        else
                            order.setSubmissionDate(Iso8601.toCalendar(orderJson.getString("submissionDate")).getTime());

                        JSONArray pictureIdsJson = orderJson.getJSONArray("pictureIds");
                        int[] pictureIds = new int[pictureIdsJson.length()];

                        for(int n = 0; n < pictureIdsJson.length(); ++n)
                            pictureIds[n] = pictureIdsJson.getInt(n);

                        order.setPictureIds(pictureIds);

                        ordersHashCode = (int)(17 * order.hashCode() + ordersHashCode);
                        newOrders.add(order);
                    }

                    if(lastOrdersHashCode != ordersHashCode)
                    {
                        synchronized(adapter)
                        {
                            ArrayList<Order> orders = adapter.getAllOrders();

                            orders.clear();

                            for(Order order : newOrders)
                                orders.add(order);

                            // Yes, stupid hack, but I'm not willing to spend more time on more sophisticated filtering
                            adapter.filter();
                        }

                        lastOrdersHashCode = ordersHashCode;
                    }
                }
                catch(Exception e)
                {
                    Toast.makeText(context, "Invalid JSON: " + e, Toast.LENGTH_LONG).show();
                }

                int oldOrdersCount = adapter.getCount();

                heading.setText(String.format(getResources().getString(R.string.old_orders_heading_fmt), oldOrdersCount));
            }
        };

        task.execute();
    }
}
