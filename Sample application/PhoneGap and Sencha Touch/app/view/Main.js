console.log("main view")

Ext.define("MobiPrint.view.Main", {
    extend: 'Ext.tab.Panel',
    requires: [
        'Ext.TitleBar'
    ],
    config: {
        tabBarPosition: 'bottom',

        items: [
            {
                title: _("OLD_ORDERS"),
                iconCls: 'organize',

                styleHtmlContent: true,
                scrollable: true,

                items: {
                    docked: 'top',
                    xtype: 'titlebar',
                    title: _("OLD_ORDERS")
                },

                html: "<a href=\"javascript:navigator.notification.alert('Congratulations, you are ready to work with Sencha Touch 2 and PhoneGap!')\">Click me</a>",
            },
            {
                title: _("ADD_PICTURES"),
                iconCls: 'add',

                styleHtmlContent: true,
                scrollable: true,

                items: {
                    docked: 'top',
                    xtype: 'titlebar',
                    title: _("ADD_PICTURES")
                },

                html: "",
            },
            {
                title: _("CURRENT_ORDER"),
                iconCls: 'action',

                styleHtmlContent: true,
                scrollable: true,

                items: {
                    docked: 'top',
                    xtype: 'titlebar',
                    title: _("CURRENT_ORDER")
                },

                html: "",
            },
        ]
    }
});
