package de.andidog.mobiprint;

import java.io.File;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.impl.client.DefaultHttpClient;

import android.content.Context;
import android.database.DataSetObserver;
import android.os.AsyncTask;
import android.widget.Toast;

public class PictureUploadTask extends AsyncTask<String, Void, Void>
{
    private Context context;

    private String error;

    private static List<DataSetObserver> observers = new ArrayList<DataSetObserver>();

    private static Set<String> uploadingPictureFilenames = new HashSet<String>();

    public PictureUploadTask(Context context)
    {
        this.context = context;
        this.error = null;
    }

    public static Set<String> getUploadingPictures()
    {
        synchronized(uploadingPictureFilenames)
        {
            return new HashSet<String>(uploadingPictureFilenames);
        }
    }

    public static boolean isPictureUploading(String filename)
    {
        synchronized(uploadingPictureFilenames)
        {
            return uploadingPictureFilenames.contains(filename);
        }
    }

    @Override
    protected Void doInBackground(String... params)
    {
        for(String filename : params)
        {
            if(isPictureUploading(filename))
                throw new RuntimeException("Can't start picture upload of the same file twice");
        }

        try
        {
            synchronized(uploadingPictureFilenames)
            {
                for(String filename : params)
                    uploadingPictureFilenames.add(filename);
            }

            notifyUploadingPicturesChanged();

            for(String filename : params)
            {
                DefaultHttpClient client = new DefaultHttpClient();
                HttpResponse response;

                HttpPut request = new HttpPut(Settings.BASE_URI + "pictures/");
                MultipartEntity entity = new MultipartEntity();
                entity.addPart("picture", new FileBody(new File(filename), "image/jpeg"));
                request.setEntity(entity);
                response = client.execute(request);

                if(response.getStatusLine().getStatusCode() < 200 || response.getStatusLine().getStatusCode() >= 300)
                    throw new Exception("Status " + response.getStatusLine());
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
            synchronized(uploadingPictureFilenames)
            {
                for(String filename : params)
                    uploadingPictureFilenames.remove(filename);
            }

            notifyUploadingPicturesChanged();
        }
    }

    private synchronized static void notifyUploadingPicturesChanged()
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

    public synchronized static void registerObserver(DataSetObserver dataSetObserver)
    {
        observers.add(dataSetObserver);
    }
}
