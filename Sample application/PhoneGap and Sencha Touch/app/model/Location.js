Ext.define("MobiPrint.model.Location", {
    extend: "Ext.data.Model",
    config: {
        fields: ["name", "address"],
        proxy: {
            type: "memory",
            reader: {
                type: "json",
                rootProperty: "locations"
            }
        }
    }
})
