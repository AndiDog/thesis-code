package org.dyndns.andidogs.mobiprint.util;

import org.apache.cordova.DroidGap;

import android.widget.Toast;

public class ToastExtension
{
    private DroidGap activity;

    public ToastExtension(DroidGap activity)
    {
        this.activity = activity;
    }

    public void showLongToast(String message)
    {
        Toast.makeText(activity, message, Toast.LENGTH_LONG).show();
    }
}
