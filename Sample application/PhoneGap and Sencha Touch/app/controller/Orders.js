Ext.define("MobiPrint.controller.Orders", {
    extend: "Ext.app.Controller",

    config: {
        refs: {
            currentOrderDetailView: "#current-order-detail",
            currentOrderNavigationView: "#currentorder-navigationview",
            locationSearchField: "#order-submission searchfield",
            ordersList: "#orders-list",
            ordersListLabel: "#orders-list-label",
            ordersListNavigationView: "#orderslist-navigationview",
            orderSubmissionView: "#order-submission",
            showOrderSubmissionButton: "#show-submit-order-button",
            submitOrderButton: "#submit-order-button",
            submitOrderConfirmationCheckbox: "#order-submission checkboxfield",
            submitOrderStoresList: "#order-submission list",
            submitOrderPasswordField: "#order-submission passwordfield",
            submitOrderUsernameField: "#order-submission-username",
            tabs: "#tabs",
            orderSubmissionView: "#order-submission",
        },
        control: {
            "#current-order-detail": {
                show: "onShowOrderDetail"
            },
            "#order-submission searchfield": {
                change: "onLocationFieldChanged",

                // Don't just use "change" event because that fires on blur, i.e. when the widget is unfocused
                keyup: "onLocationFieldChanged"
            },
            "#orders-list": {
                itemtap: "onDiscloseOrder"
            },
            "#show-submit-order-button": {
                tap: "onShowSubmitOrder"
            },
            "#submit-order-button": {
                tap: "onSubmitOrder"
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

    fillInLocation: function() {
        var _this = this

        var success = function(position) {
            _this.getLocationSearchField().setValue(position.coords.latitude + "," + position.coords.longitude)
        }

        var fail = function(error) {
            navigator.toast.showLongToast("Failed to retrieve position: " + error.message)

            _this.getLocationSearchField().setValue(window.localStorage.getItem("loc", ""))
        }

        navigator.geolocation.getCurrentPosition(success, fail)
    },

    getUploadingPictures: function() {
        var uploadingPictures = MobiPrint.controller.PictureFolders.getUploadingPictures()
        var ret = {}

        // Must copy the object in order to pass it to the view or else it cannot determine when to update the view
        // if something changed
        for(var key in uploadingPictures)
            ret[key] = uploadingPictures[key]

        return ret
    },

    launch: function() {
        console.log("Controller: Orders")

        var _this = this

        var app = this.getInitialConfig("application")
        app.addListener("picture-upload-started", function() {
            _this.updateCurrentOrderDetail()
        })
        app.addListener("picture-upload-finished", function() {
            Ext.getStore("Orders").updateOrdersList()
        })

        Ext.getStore("Orders").addListener("refresh", this.onOrdersListRefresh, this)

        this.onOrdersListRefresh()
        setInterval(function() { Ext.getStore("Orders").updateOrdersList() }, 60000)
        setTimeout(function() { Ext.getStore("Orders").updateOrdersList() }, 1000)

        // Auto-download thumbnails of current order and last order
        this.autoDownloadThumbnails(2)
    },

    onDiscloseOrder: function(list, index, target, record) {
        this.showOrderDetail(record.data)
    },

    onLocationFieldChanged: function() {
        var newValue = this.getLocationSearchField().getValue()
        window.localStorage.setItem("loc", newValue)

        setTimeout(function() {
            var loc = window.localStorage.getItem("loc")
            console.log("Getting stores from location " + loc)
            Ext.getStore("Locations").retrieve(loc)
        }, 1000)
    },

    onOrdersListRefresh: function() {
        var ordersStore = Ext.getStore("Orders")

        // Automatically cache thumbnails of last 5 orders
        this.autoDownloadThumbnails(5)

        var count = ordersStore.getOldOrdersCount()
        this.getOrdersListLabel().setHtml(Ext.String.format(_("NUM_OLD_ORDERS_FMT").toString(), count))

        this.updateCurrentOrderDetail()

        Ext.getStore("OrdersOnlyOld").load()
    },

    onShowOrderDetail: function() {
        this.getShowOrderSubmissionButton().show()
    },

    onShowSubmitOrder: function() {
        var currentOrder = Ext.getStore("Orders").findRecord("submissionDate", null)

        if(!currentOrder || currentOrder.get("pictureIds").length == 0)
        {
            navigator.notification.alert(_("NO_PICTURES_SELECTED"))
            return
        }

        this.getShowOrderSubmissionButton().hide()
        this.getCurrentOrderNavigationView().push({xtype: "mobiprint-ordersubmission"})
        this.getOrderSubmissionView().setNumPictures(currentOrder.get("pictureIds").length)

        this.fillInLocation()
    },

    onSubmitOrder: function() {
        var username = this.getSubmitOrderUsernameField().getValue()
        var password = this.getSubmitOrderPasswordField().getValue()

        if(!this.getSubmitOrderConfirmationCheckbox().isChecked() ||
           this.getSubmitOrderStoresList().getSelection().length != 1 ||
           username.length == 0 ||
           password.length == 0)
        {
            navigator.notification.alert(_("MUST_CONFIRM_ORDER"))
            return
        }

        var storeId = this.getSubmitOrderStoresList().getSelection()[0].get("id")

        var currentOrderId = Ext.getStore("Orders").findRecord("submissionDate", null).get("id")

        var _this = this

        Ext.Ajax.request({
            url: WEB_SERVICE_BASE_URI + "order/" + currentOrderId + "/submit/",
            method: "POST",
            params: {
                username: username,
                password: password,
                storeId: storeId
            },
            success: function() {
                Ext.getStore("Orders").updateOrdersList()

                // Show orders list
                _this.getTabs().setActiveItem(0)

                _this.getCurrentOrderNavigationView().pop()

                setTimeout(function() {
                    navigator.notification.alert(_("ORDER_SUBMITTED"))
                }, 1000)
            },
            failure: function() {
                navigator.notification.alert("Failed to submit order")
            }
        })
    },

    showOrderDetail: function(order) {
        var orderDetailView = Ext.create("MobiPrint.view.OrderDetail")

        var viewData = {order: order}

        if(!order.submissionDate)
            viewData.uploadingPictures = this.getUploadingPictures()

        orderDetailView.setData(viewData)

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
    },

    updateCurrentOrderDetail: function() {
        var view = this.getCurrentOrderDetailView()
        var currentOrder = Ext.getStore("Orders").findRecord("submissionDate", null)

        if(currentOrder === null)
        {
            currentOrder = {
                pictureIds: [],
                storeId: null,
                submissionDate: null
            }
        }
        else
            currentOrder = currentOrder.data

        view.setData({order: currentOrder,
                      uploadingPictures: this.getUploadingPictures()})
    }
})
