package de.andidog.mobiprint;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.util.Calendar;
import java.util.Date;

import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.cookie.DateUtils;
import org.json.JSONObject;

import android.content.Context;
import android.os.AsyncTask;
import android.util.DisplayMetrics;
import android.view.WindowManager;
import android.widget.Toast;

public class DownloadThumbnailTask extends AsyncTask<Void, Void, Void>
{
    protected Context context;

    private String error;

    protected int pictureId;

    private DisplayMetrics screenMetrics = new DisplayMetrics();

    public DownloadThumbnailTask(Context context, WindowManager wm, int pictureId)
    {
        this.context = context;
        this.error = null;
        this.pictureId = pictureId;

        wm.getDefaultDisplay().getMetrics(screenMetrics);
    }

    protected File getFile(boolean jsonFile)
    {
        File cacheDir = context.getCacheDir();
        return new File(cacheDir.getAbsolutePath(), "th-" + pictureId + ".jpg" + (jsonFile ? ".json" : ""));
    }

    public static File getFile(Context context, int pictureId)
    {
        File cacheDir = context.getCacheDir();
        return new File(cacheDir.getAbsolutePath(), "th-" + pictureId + ".jpg");
    }

    @Override
    protected Void doInBackground(Void... params)
    {
        FileInputStream stream = null;
        InputStreamReader in = null;

        try
        {
            File cachedFile = getFile(false);

            if(cachedFile.exists() && cachedFile.length() > 500)
            {
                File jsonFile = getFile(true);
                stream = new FileInputStream(jsonFile);
                in = new InputStreamReader(stream);

                // Fair enough :D
                char[] buffer = new char[(int)jsonFile.length() * 4];
                int len = in.read(buffer, 0, buffer.length);
                JSONObject o = new JSONObject(String.valueOf(buffer, 0, len));
                if(new Date().after(Iso8601.toCalendar(o.getString("expires")).getTime()))
                    cachedFile.delete();
                else
                    return null;
            }

            DefaultHttpClient client = new DefaultHttpClient();
            HttpResponse response;

            // Use screen width as thumbnail size
            int size = Math.min(500, Math.max(5, Math.min(screenMetrics.widthPixels, screenMetrics.heightPixels)));

            response = client.execute(new HttpGet(Settings.BASE_URI + "picture/" + pictureId + "/thumbnail/?size="
                                                  + size));

            if(response.getStatusLine().getStatusCode() < 200 || response.getStatusLine().getStatusCode() >= 300)
                throw new Exception("Status " + response.getStatusLine());

            InputStream thumbnailStream = response.getEntity().getContent();
            OutputStream fileStream = new FileOutputStream(getFile(false));

            byte[] buffer = new byte[32768];
            int len;

            while((len = thumbnailStream.read(buffer, 0, 32768)) > 0)
                fileStream.write(buffer, 0, len);

            fileStream.flush();
            thumbnailStream.close();
            fileStream.close();

            Date expires;
            Header[] expiresHeaders = response.getHeaders("Expires");
            if(expiresHeaders.length == 1)
                expires = DateUtils.parseDate(expiresHeaders[0].getValue());
            else
            {
                // Cache 1 day if no header exists
                Calendar cal = Calendar.getInstance();
                cal.add(Calendar.DATE, 1);
                expires = cal.getTime();
            }

            OutputStreamWriter jsonFileStream = new OutputStreamWriter(new FileOutputStream(getFile(true)));
            Calendar expiresCal = Calendar.getInstance();
            expiresCal.setTime(expires);
            jsonFileStream.write("{\"expires\":\"" + Iso8601.fromCalendar(expiresCal) + "\"}");
            jsonFileStream.flush();
            jsonFileStream.close();

            return null;
        }
        catch(Exception e)
        {
            error = "Failed to retrieve thumbnail: " + e.toString();

            return null;
        }
        finally
        {
            try
            {
                if(in != null)
                    in.close();
                if(stream != null)
                    stream.close();
            }
            catch(IOException e)
            {
            }
        }
    }

    @Override
    protected void onPostExecute(Void result)
    {
        if(error != null)
        {
            Toast toast = Toast.makeText(context, error, Toast.LENGTH_SHORT);
            toast.show();
        }
    }
}
