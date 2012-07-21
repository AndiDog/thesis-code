package de.andidog.mobiprint;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;

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

    private boolean forceRequest;

    private boolean forceUseCache;

    public DownloadOldOrdersTask(Context context, boolean forceUseCache, boolean forceRequest)
    {
        if(forceUseCache && forceRequest)
            throw new RuntimeException("Assertion failed: !(forceUseCache && forceRequest)");

        this.context = context;
        this.error = null;
        this.forceUseCache = forceUseCache;
        this.forceRequest = forceRequest;
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
        FileInputStream stream = null;
        InputStreamReader in = null;

        try
        {
            File cacheDir = context.getCacheDir();
            File cachedFile = new File(cacheDir.getAbsolutePath(), "orders.json");

            if(!forceRequest && cachedFile.exists() && cachedFile.length() < 1048576 &&
               (System.currentTimeMillis() - cachedFile.lastModified() < 30000 || forceUseCache))
            {
                stream = new FileInputStream(cachedFile);
                in = new InputStreamReader(stream);

                // Fair enough :D
                char[] buffer = new char[(int)cachedFile.length()*4];
                int len = in.read(buffer, 0, buffer.length);
                return new JSONArray(String.valueOf(buffer, 0, len));
            }
            else
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

                JSONArray ret = res.getJSONArray("orders");
                cacheResult(ret);
                return ret;
            }
        }
        catch(Exception e)
        {
            error = "Failed to retrieve old orders: " + e.toString();

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
    protected void onPostExecute(JSONArray result)
    {
        if(result == null)
        {
            Toast toast = Toast.makeText(context, error, Toast.LENGTH_LONG);
            toast.show();
        }
    }
}
