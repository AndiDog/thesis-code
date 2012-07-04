package de.andidog.mobiprint;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.CharBuffer;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONArray;
import org.json.JSONObject;

import android.content.Context;
import android.os.AsyncTask;
import android.widget.Toast;

public class DownloadOldOrdersTask extends AsyncTask<Void, Void, JSONArray>
{
    protected Context context;

    private String error;

    private boolean forceUseCache;

    public DownloadOldOrdersTask(Context context, boolean forceUseCache)
    {
        this.context = context;
        this.error = null;
        this.forceUseCache = forceUseCache;
    }

    private void cacheResult(JSONArray result)
    {
        File cacheDir = context.getCacheDir();
        FileOutputStream stream = null;

        try
        {
            stream = new FileOutputStream(new File(cacheDir.getAbsolutePath(), "orders.json"));
            stream.write(result.toString().getBytes());
        }
        catch(IOException e)
        {
            e.printStackTrace();
        }
        finally
        {
            try
            {
                if(stream != null)
                    stream.close();
            }
            catch(IOException e)
            {
                e.printStackTrace();
            }
        }
    }

    @Override
    protected JSONArray doInBackground(Void... params)
    {
        try
        {
            File cacheDir = context.getCacheDir();
            File cachedFile = new File(cacheDir.getAbsolutePath(), "orders.json");
            FileInputStream stream = null;

            if(cachedFile.exists() && cachedFile.length() < 1048576 &&
               (System.currentTimeMillis() - cachedFile.lastModified() < 30000 || forceUseCache))
            {
                stream = new FileInputStream(cachedFile);
                InputStreamReader in = new InputStreamReader(stream);

                // Fair enough :D
                char[] buffer = new char[(int)cachedFile.length()*4];
                int len = in.read(buffer, 0, buffer.length);
                return new JSONArray(String.valueOf(buffer, 0, len));
            }
            else if(!forceUseCache)
            {
                DefaultHttpClient client = new DefaultHttpClient();
                HttpResponse response;

                response = client.execute(new HttpGet(Settings.BASE_URI + "orders/"));

                if(response.getStatusLine().getStatusCode() < 200 || response.getStatusLine().getStatusCode() >= 300)
                    throw new Exception("Status " + response.getStatusLine());

                StringBuilder builder = new StringBuilder();
                BufferedReader reader = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
                String line;
                JSONObject res;

                while((line = reader.readLine()) != null)
                    builder.append(line);

                res = new JSONObject(builder.toString());

                return res.getJSONArray("orders");
            }

            return null;
        }
        catch(Exception e)
        {
            error = "Failed to retrieve old orders: " + e.toString();

            return null;
        }
    }

    @Override
    protected void onPostExecute(JSONArray result)
    {
        if(result == null)
        {
            Toast toast = Toast.makeText(context, error, Toast.LENGTH_LONG);
            toast.show();
        }
        else
            cacheResult(result);
    }
}
