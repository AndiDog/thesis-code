package de.andidog.mobiprint;

import java.io.BufferedReader;
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

    public DownloadOldOrdersTask(Context context)
    {
        this.context = context;
        this.error = null;
    }

    @Override
    protected JSONArray doInBackground(Void... params)
    {
        DefaultHttpClient client = new DefaultHttpClient();
        HttpResponse response;

        try
        {
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

            JSONArray orders = res.getJSONArray("orders");

            for(int i = 0; i < orders.length(); ++i)
                System.out.println(orders.getJSONObject(i).getInt("id"));

            return orders;
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
    }
}
