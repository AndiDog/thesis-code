package de.andidog.mobiprint;

import android.app.TabActivity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.TabHost;
import android.widget.TabHost.TabSpec;

public class TabsActivity extends TabActivity
{
    private static TabsActivity instance;

    public static TabsActivity getInstance()
    {
        return instance;
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        instance = this;

        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        TabHost tabHost = getTabHost();

        // Old orders tab
        TabSpec oldOrdersTab = tabHost.newTabSpec("old-orders");
        oldOrdersTab.setIndicator(getResources().getString(R.string.old_orders),
                                  getResources().getDrawable(R.drawable.old_orders_tab));
        Intent oldOrdersIntent = new Intent(this, OldOrdersActivity.class);
        oldOrdersTab.setContent(oldOrdersIntent);

        // Add pictures tab
        TabSpec addPicturesTab = tabHost.newTabSpec("add-pictures");
        addPicturesTab.setIndicator(getResources().getString(R.string.add_pictures),
                                    getResources().getDrawable(R.drawable.add_pictures_tab));
        Intent addPicturesIntent = new Intent(this, AddPicturesActivity.class);
        addPicturesTab.setContent(addPicturesIntent);

        // Current order tab
        TabSpec currentOrderTab = tabHost.newTabSpec("current-order");
        currentOrderTab.setIndicator(getResources().getString(R.string.current_order),
                                     getResources().getDrawable(R.drawable.current_order_tab));
        Intent currentOrderIntent = new Intent(this, OrderDetailActivity.class);
        currentOrderIntent.putExtra("showCurrentOrder", true);
        currentOrderTab.setContent(currentOrderIntent);

        tabHost.addTab(oldOrdersTab);
        tabHost.addTab(addPicturesTab);
        tabHost.addTab(currentOrderTab);
    }
}
