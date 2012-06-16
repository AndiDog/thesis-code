Ext.define("MobiPrint.controller.Orders", {
    extend: "Ext.app.Controller",

    config: {
        refs: {
            ordersList: "#orders-list",
            ordersListLabel: "#orders-list-label",
            ordersListNavigationView:  "#orderslist-navigationview"
        },
        control: {
            "#orders-list": {
                disclose: "onDiscloseOrder"
            },
        }
    },

    autoDownloadThumbnails: function(lastNOrders) {
        var ordersStore = Ext.getStore("Orders")
        var orders = ordersStore.getData().items
        var hadCurrentOrder = false

        for(var n = Math.max(0, orders.length - lastNOrders); n < orders.length; ++n)
        {
            var order = orders[n].data

            if(!order.submissionDate)
                hadCurrentOrder = true

            for(var i = 0; i < order.pictureIds.length; ++i)
                this.startThumbnailDownload(order.pictureIds[i])
        }

        if(!hadCurrentOrder)
            for(var n = 0; n < orders.length - lastNOrders; ++n)
            {
                var order = orders[n].data

                if(!order.submissionDate)
                {
                    for(var i = 0; i < order.pictureIds.length; ++i)
                        this.startThumbnailDownload(order.pictureIds[i])

                    break
                }
            }
    },

    constructor: function(config) {
        this.callParent([config])

        this.downloadingThumbnails = {}
    },

    launch: function() {
        console.log("Controller: Orders")

        Ext.getStore("Orders").addListener("refresh", this.onOrdersListRefresh, this)

        this.onOrdersListRefresh()
        setInterval(function() { Ext.getStore("Orders").updateOrdersList() }, 60000)
        setTimeout(function() { Ext.getStore("Orders").updateOrdersList() }, 1000)

        // Auto-download thumbnails of current order and last order
        this.autoDownloadThumbnails(2)

        /* TODO: redraw view
           Ext.Viewport.addListener("orientationchange", function() {
            alert("orientation changed")
        })*/
    },

    onDiscloseOrder: function(list, record) {
        this.showOrderDetail(record.data)
    },

    onOrdersListRefresh: function() {
        var ordersStore = Ext.getStore("Orders")

        // Automatically cache thumbnails of last 5 orders
        this.autoDownloadThumbnails(5)

        var count = ordersStore.getOldOrdersCount()
        this.getOrdersListLabel().setHtml(Ext.String.format(_("NUM_OLD_ORDERS_FMT").toString(), count))
    },

    onItemDisclosure: function(record) {
        Ext.app.Application.dispatch({
            controller: "MobiPrint.controller.Orders",
            action: "showOrderDetail",
            data: record.data
        })
    },

    showOrderDetail: function(order) {
        var orderDetailView = Ext.create("MobiPrint.view.OrderDetail")
        orderDetailView.setData(order)

        this.getOrdersListNavigationView().push(orderDetailView)
    },

    startThumbnailDownload: function(pictureId) {
        if(this.downloadingThumbnails[pictureId] == true)
            return

        this.downloadingThumbnails[pictureId] = true

        try
        {
            console.log("Automatically downloading thumbnail " + pictureId)

            if(THUMBNAIL_SIZE == null)
                THUMBNAIL_SIZE = Math.max(5, Math.min(500, Math.floor(window.innerWidth * 2 / 3)))

            Ext.Ajax.request({
                url: WEB_SERVICE_BASE_URI + "picture/" + pictureId + "/thumbnail/?size=" + THUMBNAIL_SIZE,
                timeout: 20000,
                success: function(response) {
                    console.log("Successfully downloaded thumbnail " + pictureId)
                },
                callback: function() {
                    delete this.downloadingThumbnails[pictureId]
                },
                scope: this
            })
        }
        catch(e)
        {
            delete this.downloadingThumbnails[pictureId]
            throw e
        }
    }
})
