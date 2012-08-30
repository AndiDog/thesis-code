package de.andidog.mobiprint;

import java.io.File;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;

public class MemoryEfficientPictureLoading
{
    private static String TAG = "MemoryEfficientPictureLoading";

    // https://developer.android.com/training/displaying-bitmaps/load-bitmap.html
    protected static int calculateInSampleSize(BitmapFactory.Options options, int reqWidth, int reqHeight)
    {
        // Raw height and width of image
        final int height = options.outHeight;
        final int width = options.outWidth;
        int inSampleSize = 1;

        if(height > reqHeight || width > reqWidth)
        {
            if(width > height)
            {
                inSampleSize = Math.round((float)height / (float)reqHeight);
            }
            else
            {
                inSampleSize = Math.round((float)width / (float)reqWidth);
            }
        }
        return inSampleSize;
    }

    public static Bitmap loadThumbnail(final File file, final int maxImageWidthPx)
    {
        final BitmapFactory.Options decodeOptions = new BitmapFactory.Options();
        decodeOptions.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(file.getAbsolutePath(), decodeOptions);
        if(decodeOptions.outWidth <= 0 || decodeOptions.outHeight <= 0)
        {
            Log.e(TAG, "Failed to decode picture " + file.getName());
            return null;
        }

        final int imageWidthPx = Math.min(decodeOptions.outWidth, maxImageWidthPx);
        final int imageHeightPx = (int)Math.round(Math.ceil(decodeOptions.outHeight * imageWidthPx / decodeOptions.outWidth));

        decodeOptions.inJustDecodeBounds = false;
        decodeOptions.inSampleSize = calculateInSampleSize(decodeOptions,
                                                           maxImageWidthPx,
                                                           imageHeightPx);

        try
        {
            return BitmapFactory.decodeFile(file.getAbsolutePath(), decodeOptions);
        }
        catch(OutOfMemoryError e)
        {
            Log.e(TAG, "Out of memory - not loading picture " + file.getName());
            return null;
        }
    }

}
