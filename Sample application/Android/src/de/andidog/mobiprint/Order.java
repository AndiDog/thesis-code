package de.andidog.mobiprint;

import java.util.Date;

public class Order
{
    private int id;

    private int[] pictureIds;

    private Date submissionDate;

    public int getId()
    {
        return id;
    }

    public int[] getPictureIds()
    {
        if(pictureIds == null)
            pictureIds = new int[0];

        return pictureIds;
    }

    public Date getSubmissionDate()
    {
        return submissionDate;
    }

    public void setId(int id)
    {
        this.id = id;
    }

    public void setPictureIds(int[] pictureIds)
    {
        this.pictureIds = pictureIds;
    }

    public void setSubmissionDate(Date submissionDate)
    {
        this.submissionDate = submissionDate;
    }
}
