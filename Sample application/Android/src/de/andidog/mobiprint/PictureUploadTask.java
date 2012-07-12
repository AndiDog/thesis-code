package de.andidog.mobiprint;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import android.content.Context;
import android.database.DataSetObserver;
import android.os.AsyncTask;
import android.widget.Toast;

public class PictureUploadTask extends AsyncTask<String, Void, Void>
{
    private Context context;

    private String error;

    private static List<DataSetObserver> observers = new ArrayList<DataSetObserver>();

    private static Set<String> uploadingPictureIds = new HashSet<String>();

    public PictureUploadTask(Context context)
    {
        this.context = context;
        this.error = null;
    }

    public synchronized static Set<String> getUploadingPictures()
    {
        return new HashSet<String>(uploadingPictureIds);
    }

    public synchronized static boolean isPictureUploading(String filename)
    {
        return uploadingPictureIds.contains(filename);
    }

    @Override
    protected Void doInBackground(String... params)
    {
        try
        {
            for(String filename : params)
            {
                if(isPictureUploading(filename))
                    throw new RuntimeException("Can't start picture upload of the same file twice");

                uploadingPictureIds.add(filename);
            }

            notifyUploadingPicturesChanged();

            for(String filename : params)
            {
                // TODO: ACTUAL UPLOAD
            }

            return null;
        }
        catch(Exception e)
        {
            error = "Failed to upload picture: " + e.toString();

            return null;
        }
        finally
        {
            // TODO: RESET ISUPLOADING
            notifyUploadingPicturesChanged();
        }
    }

    private static void notifyUploadingPicturesChanged()
    {
        for(DataSetObserver observer : observers)
            observer.onChanged();
    }

    @Override
    protected void onPostExecute(Void result)
    {
        if(error != null)
        {
            Toast toast = Toast.makeText(context, error, Toast.LENGTH_LONG);
            toast.show();
        }
    }

    public static void registerObserver(DataSetObserver dataSetObserver)
    {
        observers.add(dataSetObserver);
    }
}
