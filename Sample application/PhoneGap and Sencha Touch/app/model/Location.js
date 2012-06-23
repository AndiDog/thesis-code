Ext.define("MobiPrint.model.Location", {
    extend: "Ext.data.Model",
    config: {
        fields: [
            {name: "id", type: "id"},
            {name: "name", type: "string"},
            {name: "address", type: "string"}
        ],
        proxy: {
            type: "memory",
            reader: {
                type: "json",
                rootProperty: "locations"
            }
        }
    }
})
