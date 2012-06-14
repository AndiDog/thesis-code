console.log("main view")

Ext.define("MobiPrint.view.Tabs", {
    extend: "Ext.tab.Panel",
    requires: [
        "Ext.navigation.View",
        "MobiPrint.view.OrderDetail",
        "MobiPrint.view.OrdersList"
    ],
    config: {
        tabBarPosition: "bottom",

        items: [{
                xtype: "navigationview",
                id: "orderslist-navigationview",
                styleHtmlContent: true,
                scrollable: true,
                iconCls: "organize",
                title: _("OLD_ORDERS"),
                items: {
                    xtype: "mobiprint-orderslist",
                    title: _("OLD_ORDERS"),
                }
            }, {
                title: _("ADD_PICTURES"),
                iconCls: "add",
                layout: "fit",
                styleHtmlContent: true,
                scrollable: true,

                items: {
                    docked: "top",
                    xtype: "titlebar",
                    title: _("ADD_PICTURES")
                },

                html: "",
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
