package de.andidog.mobiprint;

import java.util.ArrayList;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

public class PictureFolderCollectionAdapter extends ArrayAdapter<PictureFolder>
{
    private static PictureFolderCollectionAdapter instance;

    private static ArrayList<PictureFolder> folders = new ArrayList<PictureFolder>();

    private PictureFolderCollectionAdapter(Context context)
    {
        super(context, 0, folders);
    }

    public synchronized static PictureFolderCollectionAdapter getInstance(Context fixedContext)
    {
        if(instance == null)
            instance = new PictureFolderCollectionAdapter(fixedContext);

        return instance;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent)
    {
        View view = convertView;
        if(view == null)
        {
            LayoutInflater inflater = (LayoutInflater)getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            view = inflater.inflate(R.layout.picture_folder_list_item, null);
        }

        PictureFolder folder = null;

        folder = folders.get(position);

        if(folder == null)
            return view;

        TextView folderNameView = (TextView)view.findViewById(R.id.folder_name);
        TextView numPicturesTextView = (TextView)view.findViewById(R.id.folder_num_pictures);

        folderNameView.setText(pathToName(folder.getPath()));
        numPicturesTextView.setText(String.format(getContext().getResources().getString(R.string.num_pictures_fmt),
                                                  folder.getNumPictures()));

        return view;
    }

    private static String pathToName(String path)
    {
        int found = path.lastIndexOf('/');

        if(found != -1)
            return path.substring(found + 1);
        else
            return path;
    }
}
