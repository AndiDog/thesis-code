package de.andidog.mobiprint;

import java.io.File;
import java.io.FileFilter;

import android.app.Activity;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.LinearLayout.LayoutParams;
import android.widget.TextView;

public class AddPicturesSelectionActivity extends Activity
{
    private static String TAG = "AddPicturesSelectionActivity";

    private PictureFolderCollectionAdapter adapter;

    private TextView heading;

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.add_pictures_selection);

        heading = (TextView)findViewById(R.id.add_pictures_selection_heading);

        Button confirmButton = (Button)findViewById(R.id.add_selected_pictures);
        confirmButton.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v)
            {
                finish();
            }
        });

        Button cancelButton = (Button)findViewById(R.id.cancel_selecting_pictures);
        cancelButton.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v)
            {
                finish();
            }
        });

        adapter = PictureFolderCollectionAdapter.getInstance(this);

        String path = getIntent().getExtras().getString("path");

        File[] list = new File(path).listFiles(new FileFilter() {
            public boolean accept(File file)
            {
                return !file.getName().startsWith(".") && file.isFile()
                       && file.getName().toLowerCase().endsWith(".jpg") && file.length() < 2048576;
            }
        });

        if(list == null)
            list = new File[0];

        LayoutInflater inflater = (LayoutInflater)getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        LinearLayout parent = (LinearLayout)findViewById(R.id.pictures_scrollview);
        DisplayMetrics screenMetrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(screenMetrics);

        int maxImageWidthPx = screenMetrics.widthPixels - 20;

        for(File file : list)
        {
            LinearLayout layout = (LinearLayout)inflater.inflate(R.layout.picture_to_add, null);
            ImageView img = (ImageView)layout.findViewById(R.id.picture_to_add);

            Bitmap bmp = BitmapFactory.decodeFile(file.getAbsolutePath());
            if(bmp == null)
            {
                Log.e(TAG, "Failed to decode picture " + file.getName());
                continue;
            }

            int imageWidthPx = Math.min(bmp.getWidth(), maxImageWidthPx);
            int imageHeightPx = bmp.getHeight() * imageWidthPx / bmp.getWidth();

            // Set ImageView to full screen width
            //img.setLayoutParams(new LayoutParams(screenMetrics.widthPixels, imageHeightPx));

            Bitmap scaledBmp = Bitmap.createScaledBitmap(bmp, imageWidthPx, imageHeightPx, true);
            bmp.recycle();

            img.setImageBitmap(scaledBmp);

            parent.addView(layout);
        }

        heading.setText(String.format(getResources().getString(R.string.num_pictures_in_folder_fmt), list.length));
    }
}
