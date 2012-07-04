package de.andidog.mobiprint;

import java.util.Date;

public class Order
{
    private int id;

    private int[] pictureIds;

    // May be NULL
    private Integer storeId;

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

    public Integer getStoreId()
    {
        return storeId;
    }

    public Date getSubmissionDate()
    {
        return submissionDate;
    }

    @Override
    public int hashCode()
    {
        return (new Object[] { id, pictureIds, storeId, submissionDate }).hashCode();
    }

    public void setId(int id)
    {
        this.id = id;
    }

    public void setPictureIds(int[] pictureIds)
    {
        this.pictureIds = pictureIds;
    }

    public void setStoreId(Integer storeId)
    {
        this.storeId = storeId;
    }

    public void setSubmissionDate(Date submissionDate)
    {
        this.submissionDate = submissionDate;
    }
}
