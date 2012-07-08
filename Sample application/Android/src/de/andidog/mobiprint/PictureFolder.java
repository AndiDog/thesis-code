package de.andidog.mobiprint;

public class PictureFolder
{
    private int numPictures;

    private String path;

    public int getNumPictures()
    {
        return numPictures;
    }

    public String getPath()
    {
        return path;
    }

    @Override
    public int hashCode()
    {
        return (path.hashCode() << 3) ^~ numPictures;
    }

    public void setNumPictures(int numPictures)
    {
        this.numPictures = numPictures;
    }

    public void setPath(String path)
    {
        this.path = path;
    }
}
