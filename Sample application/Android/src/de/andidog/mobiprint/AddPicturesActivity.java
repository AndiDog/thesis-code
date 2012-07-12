package de.andidog.mobiprint;

import java.util.ArrayList;
import java.util.List;

import android.app.ListActivity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

public class AddPicturesActivity extends ListActivity
{
    private PictureFolderCollectionAdapter adapter;

    private TextView heading;

    private int lastFoldersHashCode = -1;

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.add_pictures);

        heading = (TextView)findViewById(R.id.add_pictures_heading);

        adapter = PictureFolderCollectionAdapter.getInstance(this);
        setListAdapter(adapter);

        refresh(true);
        refresh();
    }

    @Override
    protected void onListItemClick(ListView l, View v, int position, long id)
    {
        super.onListItemClick(l, v, position, id);

        PictureFolder folder = adapter.getItem(position);

        if(folder == null)
            return;

        Intent selectPicturesIntent = new Intent(this, AddPicturesSelectionActivity.class);
        selectPicturesIntent.putExtra("path", folder.getPath());
        startActivity(selectPicturesIntent);
    }

    private void refresh()
    {
        refresh(false);
    }

    private void refresh(boolean forceUseCache)
    {
        final boolean forceUseCache_ = forceUseCache;

        ScanPictureFoldersTask task = new ScanPictureFoldersTask(this, this, forceUseCache) {
            @Override
            protected void onPostExecute(List<PictureFolder> result)
            {
                if(!forceUseCache_)
                {
                    Thread th = new Thread(new Runnable() {
                        public void run() {
                            try
                            {
                                Thread.sleep(300000);
                            }
                            catch(InterruptedException e)
                            {
                            }

                            refresh(false);
                        };
                    });

                    th.setDaemon(true);
                    th.start();
                }

                super.onPostExecute(result);

                if(result == null)
                    return;

                try
                {
                    int foldersHashCode = 0;

                    ArrayList<PictureFolder> newFolders = new ArrayList<PictureFolder>();

                    for(int i = 0; i < result.size(); ++i)
                    {
                        PictureFolder folder = result.get(i);
                        foldersHashCode = (int)(17 * folder.hashCode() + foldersHashCode);
                        newFolders.add(folder);
                    }

                    if(lastFoldersHashCode != foldersHashCode)
                    {
                        synchronized(adapter)
                        {
                            adapter.clear();

                            for(PictureFolder folder : newFolders)
                                adapter.add(folder);
                        }

                        lastFoldersHashCode = foldersHashCode;
                    }
                }
                catch(Exception e)
                {
                    Toast.makeText(context, "Failed to scan picture folders: " + e, Toast.LENGTH_LONG).show();
                }

                int foldersCount = adapter.getCount();

                heading.setText(String.format(getResources().getString(R.string.add_pictures_heading_fmt), foldersCount));
            }
        };

        task.execute();
    }
}
