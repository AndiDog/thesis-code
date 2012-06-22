console.log("main view")

Ext.define("MobiPrint.view.Tabs", {
    extend: "Ext.tab.Panel",
    requires: [
        "Ext.navigation.View",
        "MobiPrint.view.OrderDetail",
        "MobiPrint.view.OrdersList",
        "MobiPrint.view.OrderSubmission",
        "MobiPrint.view.PictureFolderDetail",
        "MobiPrint.view.PictureFoldersList"
    ],
    config: {
        tabBarPosition: "bottom",

        id: "tabs",

        items: [{
                xtype: "navigationview",
                id: "orderslist-navigationview",
                styleHtmlContent: true,
                iconCls: "organize",
                title: _("OLD_ORDERS"),
                items: {
                    xtype: "mobiprint-orderslist"
                }
            }, {
                xtype: "navigationview",
                id: "picturefolderslist-navigationview",
                styleHtmlContent: true,
                navigationBar: {
                    items: {
                        xtype: "button",
                        id: "add-pictures-button",
                        ui: "confirm",
                        text: _("ADD"),
                        align: "right",
                        hideAnimation: {
                            type: "fadeOut",
                            duration: 300
                        },
                        showAnimation: {
                            type: "fadeIn",
                            duration: 300
                        }
                    }
                },
                iconCls: "add",
                title: _("ADD_PICTURES"),
                items: {
                    xtype: "mobiprint-picturefolderslist"
                }
            }, {
                xtype: "navigationview",
                id: "currentorder-navigationview",
                styleHtmlContent: true,
                navigationBar: {
                    items: {
                        xtype: "button",
                        id: "show-submit-order-button",
                        ui: "confirm",
                        text: _("SUBMIT_ELLIPSIS"),
                        align: "right",
                        hideAnimation: {
                            type: "fadeOut",
                            duration: 300
                        },
                        showAnimation: {
                            type: "fadeIn",
                            duration: 300
                        }
                    }
                },
                iconCls: "action",
                title: _("CURRENT_ORDER"),
                items: {
                    xtype: "mobiprint-orderdetail",
                    id: "current-order-detail"
                }
            },
        ]
    }
})
