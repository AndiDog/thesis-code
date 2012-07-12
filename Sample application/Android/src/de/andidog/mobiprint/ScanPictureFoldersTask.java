package de.andidog.mobiprint;

import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Environment;
import android.widget.Toast;

public class ScanPictureFoldersTask extends AsyncTask<Void, Void, List<PictureFolder>>
{
    protected Context context;

    private String error;

    private boolean forceUseCache;

    public ScanPictureFoldersTask(Context context, boolean forceUseCache)
    {
        this.context = context;
        this.error = null;
        this.forceUseCache = forceUseCache;
    }

    private void cacheResult(List<PictureFolder> result)
    {
        File cacheDir = context.getCacheDir();
        FileOutputStream stream = null;

        try
        {
            JSONArray json = new JSONArray();

            for(PictureFolder folder : result)
            {
                JSONObject jsonFolder = new JSONObject();
                jsonFolder.put("path", folder.getPath());
                jsonFolder.put("numPictures", folder.getNumPictures());
                json.put(jsonFolder);
            }

            stream = new FileOutputStream(new File(cacheDir.getAbsolutePath(), "picture-folders.json"));
            stream.write(json.toString().getBytes());
        }
        catch(Exception e)
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
    protected List<PictureFolder> doInBackground(Void... params)
    {
        try
        {
            File cacheDir = context.getCacheDir();
            File cachedFile = new File(cacheDir.getAbsolutePath(), "picture-folders.json");
            FileInputStream stream = null;

            if(cachedFile.exists() && cachedFile.length() < 1048576
               && (System.currentTimeMillis() - cachedFile.lastModified() < 30000 || forceUseCache))
            {
                stream = new FileInputStream(cachedFile);
                InputStreamReader in = new InputStreamReader(stream);

                // Fair enough :D
                char[] buffer = new char[(int)cachedFile.length() * 4];
                int len = in.read(buffer, 0, buffer.length);
                JSONArray cached = new JSONArray(String.valueOf(buffer, 0, len));
                List<PictureFolder> ret = new ArrayList<PictureFolder>();

                for(int i = 0; i < cached.length(); ++i)
                {
                    PictureFolder folder = new PictureFolder();
                    folder.setPath(cached.getJSONObject(i).getString("path"));
                    folder.setNumPictures((int)cached.getJSONObject(i).getLong("numPictures"));
                    ret.add(folder);
                }

                return ret;
            }
            else
            {
                File root = Environment.getExternalStorageDirectory();

                List<PictureFolder> ret = new ArrayList<PictureFolder>();
                scan(root, ret);

                cacheResult(ret);

                return ret;
            }
        }
        catch(Exception e)
        {
            error = "Failed to scan for picture folders: " + e.toString();

            return null;
        }
    }

    @Override
    protected void onPostExecute(List<PictureFolder> result)
    {
        if(result == null)
        {
            Toast toast = Toast.makeText(context, error, Toast.LENGTH_LONG);
            toast.show();
        }
    }

    private void scan(File dir, List<PictureFolder> res)
    {
        scan(dir, res, 0);
    }

    private void scan(File dir, List<PictureFolder> res, int _depth)
    {
        if(_depth > 3)
            return;

        File[] list = dir.listFiles(new FileFilter() {
            public boolean accept(File file)
            {
                return !file.getName().startsWith(".")
                       && (file.isDirectory() || (file.isFile() && file.getName().toLowerCase().endsWith(".jpg")
                                                  && file.length() < 2048576));
            }
        });

        if(list == null)
            return;

        Map<String, PictureFolder> hadDirectories = new HashMap<String, PictureFolder>();

        for(File file : list)
        {
            if(file.isDirectory())
                scan(file, res, _depth + 1);
            else
            {
                PictureFolder folder = hadDirectories.get(dir.getAbsolutePath());

                if(folder == null)
                {
                    folder = new PictureFolder();
                    folder.setPath(dir.getAbsolutePath());
                    hadDirectories.put(dir.getAbsolutePath(), folder);
                    res.add(folder);
                }

                folder.setNumPictures(folder.getNumPictures() + 1);
            }
        }
    }
}
