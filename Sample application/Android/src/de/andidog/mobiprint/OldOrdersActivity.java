package de.andidog.mobiprint;

import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONObject;

import android.app.ListActivity;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

public class OldOrdersActivity extends ListActivity
{
    private OrderCollectionAdapter adapter;

    private ArrayList<Order> orders = new ArrayList<Order>();

    private TextView heading;

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.old_orders);

        heading = (TextView)findViewById(R.id.orders_list_heading);

        adapter = new OrderCollectionAdapter(this, orders);
        setListAdapter(adapter);

        refresh();
    }

    private void refresh()
    {
        DownloadOldOrdersTask task = new DownloadOldOrdersTask(this) {
            @Override
            protected void onPostExecute(JSONArray result)
            {
                super.onPostExecute(result);

                if(result == null)
                    return;

                adapter.clear();

                try
                {
                    for(int i = 0; i < result.length(); ++i)
                    {
                        JSONObject orderJson = result.getJSONObject(i);

                        Order order = new Order();
                        order.setId(orderJson.getInt("id"));
                        order.setSubmissionDate(Iso8601.toCalendar(orderJson.getString("submissionDate")).getTime());

                        JSONArray pictureIdsJson = orderJson.getJSONArray("pictureIds");
                        int[] pictureIds = new int[pictureIdsJson.length()];

                        for(int n = 0; n < pictureIdsJson.length(); ++n)
                            pictureIds[n] = pictureIdsJson.getInt(n);

                        order.setPictureIds(pictureIds);
                        //order.setSubmissionDate();

                        adapter.add(order);
                    }
                }
                catch(Exception e)
                {
                    Toast.makeText(context, "Invalid JSON: " + e, Toast.LENGTH_LONG).show();
                }

                heading.setText(String.format(getResources().getString(R.string.old_orders_heading_fmt), adapter.getCount()));
            }
        };

        task.execute();
    }
}
