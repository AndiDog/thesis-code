console.log("main view")

Ext.define("MobiPrint.view.Tabs", {
    extend: "Ext.tab.Panel",
    requires: [
        "MobiPrint.view.OrdersList"
    ],
    config: {
        tabBarPosition: "bottom",

        items: [
            {
                xtype: "mobiprint-orderslist",
                title: _("OLD_ORDERS"),
                iconCls: "organize",
                layout: "fit",
                styleHtmlContent: true,
                scrollable: true,
            },
            {
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
            },
            {
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
