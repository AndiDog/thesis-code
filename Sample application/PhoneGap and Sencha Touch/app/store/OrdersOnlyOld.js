Ext.define("MobiPrint.store.OrdersOnlyOld", {
    extend: "Ext.data.Store",
    requires: ["MobiPrint.model.Order"],
    config: {
        model: "MobiPrint.model.Order",
        sorters: "id",
        autoLoad: true,
        filters: {
            filterFn: function(item) {
                return item.data.submissionDate != null
            }
        }
    }
})
