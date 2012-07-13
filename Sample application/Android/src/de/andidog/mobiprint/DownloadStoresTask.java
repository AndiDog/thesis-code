package de.andidog.mobiprint;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.util.regex.Pattern;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONArray;
import org.json.JSONObject;

import android.content.Context;
import android.os.AsyncTask;
import android.widget.Toast;

public class DownloadStoresTask extends AsyncTask<String, Void, JSONArray>
{
    private boolean cancel;

    protected Context context;

    private String error;

    private static Pattern latLngRegex = Pattern.compile("^-?\\d{1,3}\\.\\d+;-?\\d{1,3}\\.\\d+$");

    public DownloadStoresTask(Context context)
    {
        this.context = context;
        this.error = null;
    }

    public void cancel()
    {
        cancel = true;
    }

    @Override
    protected JSONArray doInBackground(String... params)
    {
        if(params.length != 1)
            throw new AssertionError();

        // This is for delaying the task while the user types, and so that a task can be canceled
        try
        {
            Thread.sleep(2000);
        }
        catch(InterruptedException e)
        {
        }

        if(cancel)
            return null;

        String loc = params[0];

        try
        {
            DefaultHttpClient client = new DefaultHttpClient();
            HttpResponse response;
            String query;

            if(latLngRegex.matcher(loc).matches())
            {
                String[] split = loc.split(";");
                query = "lat=" + split[0] + "&lng=" + split[1];
            }
            else
                query = "loc=" + URLEncoder.encode(loc, "utf-8");

            response = client.execute(new HttpGet(Settings.BASE_URI + "stores/by-location/?" + query));

            if(response.getStatusLine().getStatusCode() < 200 || response.getStatusLine().getStatusCode() >= 300)
                throw new Exception("Status " + response.getStatusLine());

            StringBuilder builder = new StringBuilder();
            BufferedReader reader = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
            String line;
            JSONObject res;

            while((line = reader.readLine()) != null)
                builder.append(line);

            res = new JSONObject(builder.toString());

            return res.getJSONArray("stores");
        }
        catch(Exception e)
        {
            error = "Failed to retrieve stores information: " + e.toString();

            return null;
        }
    }

    @Override
    protected void onPostExecute(JSONArray result)
    {
        if(error != null)
        {
            Toast toast = Toast.makeText(context, error, Toast.LENGTH_LONG);
            toast.show();
        }
    }
}
