package de.andidog.mobiprint;

import java.util.ArrayList;

import android.app.Activity;
import android.content.Context;
import android.content.res.Configuration;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.LayoutInflater;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.LinearLayout.LayoutParams;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;

public class OrderDetailActivity extends Activity
{
    private OrderCollectionAdapter adapter;

    private Order orderToShow;

    @Override
    public void onConfigurationChanged(Configuration newConfig)
    {
        super.onConfigurationChanged(newConfig);

        relayout();
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        // TODO: either this or the order ID
        boolean showCurrentOrder = getIntent().getExtras().getBoolean("showCurrentOrder", false);

        adapter = OrderCollectionAdapter.getInstance(this);

        orderToShow = null;

        if(showCurrentOrder)
        {
            ArrayList<Order> allOrders;
            synchronized(adapter)
            {
                allOrders = adapter.getAllOrders();
            }

            for(Order order : allOrders)
                if(order.getSubmissionDate() == null)
                {
                    orderToShow = order;
                    break;
                }

            if(orderToShow == null)
                orderToShow = new Order();
        }
        else
            throw new UnsupportedOperationException("not implemented yet");

        setContentView(R.layout.order_detail);

        String numPicturesText = String.format(getResources().getString(R.string.order_num_pictures_fmt),
                                               orderToShow.getPictureIds().length);
        ((TextView)findViewById(R.id.order_num_pictures)).setText(numPicturesText);

        relayout();
    }

    private void relayout()
    {
        // Lay out in a way that each thumbnail is at least 1.5 cm wide.
        // Cannot use order_detail_layout's width because on orientation change, it stays the same and only after this
        // call gets a different width.
        DisplayMetrics screenMetrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(screenMetrics);
        int viewWidthPx = screenMetrics.widthPixels;
        float viewWidthCm = (viewWidthPx / screenMetrics.xdpi) * 2.54f;

        TableLayout table = (TableLayout)findViewById(R.id.thumbnails_table);

        final int numPicturesX = (int)Math.max(1, Math.round(Math.floor(viewWidthCm / 1.5)));
        final int border =  5;
        final int thumbMargin = 5;
        int cx = (viewWidthPx - 2 * border) / numPicturesX - thumbMargin;
        int i = 0;
        TableRow row = null;

        for(int pictureId : orderToShow.getPictureIds())
        {
            if(i % numPicturesX == 0)
            {
                if(row != null)
                    table.addView(row);

                row = new TableRow(this);
                row.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.FILL_PARENT, cx));
                //row.setBackgroundColor(0xffffffff);
            }

            // Setting margin still does not work
            LayoutInflater inflater = (LayoutInflater)getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            FrameLayout thumbnailLayout = (FrameLayout)inflater.inflate(R.layout.thumbnail, null);

            ImageView img = (ImageView)thumbnailLayout.findViewById(R.id.thumbnail_image);
            ViewGroup.LayoutParams layout = img.getLayoutParams();
            layout.width = cx;
            layout.height = cx;
            img.setLayoutParams(layout);
            img.setImageDrawable(getResources().getDrawable(R.drawable.test_thumbnail));

            ImageView stateImg = (ImageView)thumbnailLayout.findViewById(R.id.thumbnail_state_image);
            stateImg.setImageDrawable(getResources().getDrawable(R.drawable.uploading));

            TextView stateTextView = (TextView)thumbnailLayout.findViewById(R.id.state_text);
            stateTextView.setText(getResources().getString(R.string.uploading));

            row.addView(thumbnailLayout);

            ++i;
        }

        if(row != null)
            table.addView(row);
    }
}
