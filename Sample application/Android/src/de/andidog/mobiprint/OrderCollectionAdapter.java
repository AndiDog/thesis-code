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
    private static OrderCollectionAdapter instance;

    private static ArrayList<Order> orders = new ArrayList<Order>();

    private static ArrayList<Order> filteredOrders = new ArrayList<Order>();

    private SimpleDateFormat dateFormatter = new SimpleDateFormat("EEEE, MMMM d--- yyyy");

    private OrderCollectionAdapter(Context context)
    {
        super(context, 0, filteredOrders);
    }

    public synchronized void filter()
    {
        filteredOrders.clear();
        for(Order order : orders)
            if(order.getSubmissionDate() != null)
                filteredOrders.add(order);

        notifyDataSetChanged();
    }

    public ArrayList<Order> getAllOrders()
    {
        return orders;
    }

    public synchronized static OrderCollectionAdapter getInstance(Context fixedContext)
    {
        if(instance == null)
            instance = new OrderCollectionAdapter(fixedContext);

        return instance;
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

        Order order = null;

        order = filteredOrders.get(position);

        if(order != null && order.getSubmissionDate() != null)
        {
            TextView dateTextView = (TextView)view.findViewById(R.id.order_date);
            TextView numPicturesTextView = (TextView)view.findViewById(R.id.num_pictures);

            dateTextView.setText(dateFormatter.format(order.getSubmissionDate())
                            .replace("---", getMonthDayEnding(order.getSubmissionDate())));
            numPicturesTextView.setText(String.format(getContext().getResources().getString(R.string.num_pictures),
                                                      order.getPictureIds().length));
        }

        return view;
    }
}
