package org.dyndns.andidogs.mobiprint;

import org.apache.cordova.DroidGap;
import org.dyndns.andidogs.mobiprint.util.ToastExtension;

import android.os.Bundle;

public class MobiPrintActivity extends DroidGap
{
    private void addExtensions()
    {
        ToastExtension toast = new ToastExtension(this);
        appView.addJavascriptInterface(toast, "toastExtension");
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        // Ensure web view is initialized
        init();

        addExtensions();

        setIntegerProperty("loadUrlTimeoutValue", 60000);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}
