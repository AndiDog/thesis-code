Ext.define("MobiPrint.model.Order", {
    extend: "Ext.data.Model",
    config: {
        // "id" field is automatic
        fields: ["pictureIds", "storeId", "submissionDate"],
        proxy: {
            type: "localstorage",
            id: "orders"
        },
    }
})
