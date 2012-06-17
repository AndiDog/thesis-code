console.log("main view")

Ext.define("MobiPrint.view.Tabs", {
    extend: "Ext.tab.Panel",
    requires: [
        "Ext.navigation.View",
        "MobiPrint.view.OrderDetail",
        "MobiPrint.view.OrdersList",
        "MobiPrint.view.PictureFolderDetail",
        "MobiPrint.view.PictureFoldersList"
    ],
    config: {
        tabBarPosition: "bottom",

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
                iconCls: "add",
                title: _("ADD_PICTURES"),
                items: {
                    xtype: "mobiprint-picturefolderslist"
                }
            }, {
                title: _("CURRENT_ORDER"),
                iconCls: "action",
                layout: "fit",
                styleHtmlContent: true,
                scrollable: true,

                items: {
                    docked: "top",
                    xtype: "titlebar",
                    title: _("CURRENT_ORDER")
                },

                html: "",
            },
        ]
    }
})
