Ext.define("MobiPrint.store.Orders", {
    extend: "Ext.data.Store",
    requires: [
        "Ext.util.JSON",
        "MobiPrint.model.Order",
        "Ext.data.proxy.LocalStorage"
    ],
    config: {
        model: "MobiPrint.model.Order",
        /*filters: {
            filterFn: function(item) {
                return item.data.submissionDate != null
            }
        },*/
        sorters: "id",
        autoLoad: true
    },

    getOldOrdersCount: function() {
        var count = 0
        this.each(function(item) {
            if(item.data.submissionDate != null)
                ++count
        })
        return count
    },

    updateOrdersList: function() {
        var _this = this

        Ext.Ajax.request({
            url: WEB_SERVICE_BASE_URI + "orders/",
            success: function(xhr) {
                console.log("Orders list update call succeeded")

                var orders = Ext.JSON.decode(xhr.responseText).orders
                var ordersDict = {}

                for(var i = 0; i < orders.length; ++i)
                    ordersDict[orders[i].id] = orders[i]

                _this.each(function(item) {
                    if(!(item.data.id in ordersDict))
                        item.erase()
                    else
                    {
                        item.data = ordersDict[item.data.id]
                        item.save()
                        delete ordersDict[item.data.id]
                    }
                })

                for(var i = 0; i < orders.length; ++i)
                    if(orders[i].id in ordersDict)
                        new MobiPrint.model.Order(orders[i]).save()

                _this.sync()
                _this.load()
            },
            failure: function(xhr) {
                navigator.toast.showLongToast(_("FAILED_TO_RETRIEVE_ORDERS"))
            }
        })
    }
})
