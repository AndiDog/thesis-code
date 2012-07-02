package de.andidog.mobiprint;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

public class OrderCollectionAdapter extends ArrayAdapter<Order>
{
    private ArrayList<Order> objects;

    private SimpleDateFormat dateFormatter = new SimpleDateFormat("EEEE, MMMM d--- yyyy");

    public OrderCollectionAdapter(Context context, ArrayList<Order> objects)
    {
        super(context, 0, objects);
        this.objects = objects;
    }

    private String getMonthDayEnding(Date date)
    {
        String s = Integer.toString(date.getDate());

        if(s.endsWith("1"))
            return "st";
        else if(s.endsWith("2"))
            return "nd";
        else if(s.endsWith("3"))
            return "rd";
        else
            return "th";
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent)
    {
        View view = convertView;
        if(view == null)
        {
            LayoutInflater inflater = (LayoutInflater)getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            view = inflater.inflate(R.layout.order_list_item, null);
        }

        Order order = objects.get(position);

        if(order != null)
        {
            TextView dateTextView = (TextView)view.findViewById(R.id.order_date);
            TextView numPicturesTextView = (TextView)view.findViewById(R.id.num_pictures);

            // TODO: format date
            dateTextView.setText(dateFormatter.format(order.getSubmissionDate())
                                 .replace("---", getMonthDayEnding(order.getSubmissionDate())));
            numPicturesTextView.setText(String.format(getContext().getResources().getString(R.string.num_pictures),
                                                      order.getPictureIds().length));
        }

        return view;
    }
}
