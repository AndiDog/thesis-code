package de.andidog.mobiprint;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;

public class SubmitOrderActivity extends Activity
{
    private OrderCollectionAdapter adapter;

    private void addLocationRadioButton(final Location location)
    {
        final int id = location.getId();
        final RadioGroup locations = (RadioGroup)findViewById(R.id.locations);

        LayoutInflater inflater = (LayoutInflater)getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View locationLayout = inflater.inflate(R.layout.location, null);

        RadioButton radioButton = (RadioButton)locationLayout.findViewById(R.id.select_location);
        radioButton.setId(id);
        TextView nameTextView = (TextView)locationLayout.findViewById(R.id.location_name);
        nameTextView.setText(location.getName());
        nameTextView.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v)
            {
                // Note: View ID is set to location ID
                locations.check(id);
            }
        });
        TextView addressTextView = (TextView)locationLayout.findViewById(R.id.location_address);
        addressTextView.setText(location.getAddress());
        addressTextView.setOnClickListener(new OnClickListener() {
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

        addLocationRadioButton(new Location(1, "LITTLE", "somewhere"));
        addLocationRadioButton(new Location(2, "F-Markt", "somewhere else"));
    }
}
