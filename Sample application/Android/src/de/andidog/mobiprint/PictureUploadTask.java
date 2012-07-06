package de.andidog.mobiprint;

import java.util.HashSet;
import java.util.Set;

import android.content.Context;
import android.os.AsyncTask;
import android.widget.Toast;

public class PictureUploadTask extends AsyncTask<Void, Void, Void>
{
    private Context context;

    private String error;

    protected String filename;

    private static Set<String> uploadingPictureIds = new HashSet<String>();

    public PictureUploadTask(Context context, String filename)
    {
        this.context = context;
        this.error = null;
        this.filename = filename;

        if(isPictureUploading(filename))
            throw new RuntimeException("Can't start picture upload of the same file twice");
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
    protected Void doInBackground(Void... params)
    {
        try
        {
            return null;
        }
        catch(Exception e)
        {
            error = "Failed to upload picture: " + e.toString();

            return null;
        }
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
}
