package de.andidog.mobiprint;

import java.util.ArrayList;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;

import android.content.Context;
import android.os.AsyncTask;
import android.widget.Toast;

public class SubmitOrderTask extends AsyncTask<Void, Void, Void>
{
    protected Context context;

    protected String error;

    private int orderId;

    private int storeId;

    private String username;

    private String password;

    public SubmitOrderTask(Context context, int orderId, int storeId, String username, String password)
    {
        this.context = context;
        this.error = null;

        this.orderId = orderId;
        this.storeId = storeId;
        this.username = username;
        this.password = password;
    }


    @Override
    protected Void doInBackground(Void... params)
    {
        try
        {
            DefaultHttpClient client = new DefaultHttpClient();
            HttpResponse response;
            HttpPost request = new HttpPost(Settings.BASE_URI + "order/" + orderId + "/submit/");

            List<NameValuePair> postParams = new ArrayList<NameValuePair>(3);
            postParams.add(new BasicNameValuePair("storeId", Integer.toString(storeId)));
            postParams.add(new BasicNameValuePair("username", username));
            postParams.add(new BasicNameValuePair("password", password));

            request.setEntity(new UrlEncodedFormEntity(postParams));

            response = client.execute(request);

            if(response.getStatusLine().getStatusCode() < 200 || response.getStatusLine().getStatusCode() >= 300)
                throw new Exception("Status " + response.getStatusLine());

            return null;
        }
        catch(Exception e)
        {
            error = "Failed to submit order: " + e;

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
