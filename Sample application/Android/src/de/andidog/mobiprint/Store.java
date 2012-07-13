package de.andidog.mobiprint;

public class Store
{
    private String address;

    private int id;

    private String name;

    public Store(int id, String name, String address)
    {
        this.address = address;
        this.id = id;
        this.name = name;
    }

    public String getAddress()
    {
        return address;
    }

    public int getId()
    {
        return id;
    }

    public String getName()
    {
        return name;
    }

    public void setAddress(String address)
    {
        this.address = address;
    }

    public void setId(int id)
    {
        this.id = id;
    }

    public void setName(String name)
    {
        this.name = name;
    }
}
