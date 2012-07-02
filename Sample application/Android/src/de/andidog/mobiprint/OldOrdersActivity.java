package de.andidog.mobiprint;

import java.util.ArrayList;
import java.util.Date;

import android.app.ListActivity;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.TextView;

public class OldOrdersActivity extends ListActivity
{
    private ArrayList<Order> orders = new ArrayList<Order>();

    private TextView heading;

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.old_orders);

        // TEST DATA
        orders.add(new Order());
        orders.get(0).setId(5);
        orders.get(0).setSubmissionDate(new Date());

        heading = (TextView)findViewById(R.id.orders_list_heading);

        setListAdapter(new OrderCollectionAdapter(this, orders));

        refresh();
    }

    private void refresh()
    {
        heading.setText(String.format(getResources().getString(R.string.old_orders_heading_fmt), orders.size()));
    }
}
