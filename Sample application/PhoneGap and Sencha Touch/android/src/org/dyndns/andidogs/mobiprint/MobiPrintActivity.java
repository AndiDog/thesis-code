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

        super.setIntegerProperty("splashscreen", R.drawable.splash);

        // Ensure web view is initialized (appView instance)
        init();

        addExtensions();

        super.setIntegerProperty("loadUrlTimeoutValue", 60000);
        //super.showSplashScreen(15000);
        super.loadUrl("file:///android_asset/www/index.html", 20000);
    }
}
