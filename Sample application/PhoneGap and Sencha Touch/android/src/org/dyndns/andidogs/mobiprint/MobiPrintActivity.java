package org.dyndns.andidogs.mobiprint;

import org.apache.cordova.DroidGap;

import android.os.Bundle;

public class MobiPrintActivity extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setIntegerProperty("loadUrlTimeoutValue", 60000);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}
