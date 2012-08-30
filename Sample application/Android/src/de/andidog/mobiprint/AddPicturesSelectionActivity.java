package de.andidog.mobiprint;

import java.io.File;
import java.io.FileFilter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.CompoundButton.OnCheckedChangeListener;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class AddPicturesSelectionActivity extends Activity
{
    private TextView heading;

    private Map<String, Boolean> selectedPictures = new HashMap<String, Boolean>();

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.add_pictures_selection);

        heading = (TextView)findViewById(R.id.add_pictures_selection_heading);

        Button confirmButton = (Button)findViewById(R.id.add_selected_pictures);
        final Context context = this;
        confirmButton.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v)
            {
                int numSelectedPictures = 0;

                List<String> filenamesToUpload = new ArrayList<String>();
                for(Entry<String, Boolean> item : selectedPictures.entrySet())
                    if(item.getValue().booleanValue())
                    {
                        ++numSelectedPictures;

                        filenamesToUpload.add(item.getKey());

                    }

                if(numSelectedPictures > 0)
                {
                    String[] filenamesToUploadArray = filenamesToUpload.toArray(new String[numSelectedPictures]);
                    new PictureUploadTask(context).execute(filenamesToUploadArray);

                    finish();
                    Toast.makeText(context,
                                   String.format(context.getResources().getString(R.string.will_upload_n_pictures_fmt),
                                                 numSelectedPictures),
                                   Toast.LENGTH_LONG).show();

                    TabsActivity.getInstance().getTabHost().setCurrentTab(2);
                }
                else
                {
                    new AlertDialog.Builder(context)
                    .setMessage(context.getResources().getString(R.string.no_pictures_selected))
                    .setPositiveButton(android.R.string.ok, null)
                    .show();
                }
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
            CheckBox checkbox = (CheckBox)layout.findViewById(R.id.picture_checkbox);

            final String imagePath = file.getAbsolutePath();
            checkbox.setOnCheckedChangeListener(new OnCheckedChangeListener() {
                @Override
                public void onCheckedChanged(CompoundButton buttonView, boolean isChecked)
                {
                    selectedPictures.put(imagePath, isChecked);
                }
            });

            Bitmap scaledBmp = MemoryEfficientPictureLoading.loadThumbnail(file, maxImageWidthPx);
            img.setImageBitmap(scaledBmp);

            parent.addView(layout);
        }

        heading.setText(String.format(getResources().getString(R.string.num_pictures_in_folder_fmt), list.length));
    }
}
