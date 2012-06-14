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

    launch: function() {
        console.log("Controller: Orders")

        Ext.getStore("Orders").addListener("refresh", this.onOrdersListRefresh, this)

        this.onOrdersListRefresh()
        setInterval(function() { Ext.getStore("Orders").updateOrdersList() }, 60000)
        setTimeout(function() { Ext.getStore("Orders").updateOrdersList() }, 1000)

        Ext.Viewport.addListener("orientationchange", function() {
            alert("orientation changed")
        })
    },

    onDiscloseOrder: function(list, record) {
        this.showOrderDetail(record.data)
    },

    onOrdersListRefresh: function() {
        var count = Ext.getStore("Orders").getOldOrdersCount()
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
    }
})
