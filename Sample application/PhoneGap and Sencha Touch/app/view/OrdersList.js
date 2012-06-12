console.log("order list view")

var oldOrdersFilter = new Ext.util.Filter({
    filterFn: function(item) {
        return item.submissionDate != null
    }
})

Ext.define("MobiPrint.view.OrdersList", {
    extend: "Ext.Panel",
    xtype: "mobiprint-orderslist",
    requires: [
        "Ext.Label",
        "Ext.dataview.List",
        "Ext.TitleBar"
    ],
    config: {
        items: {
            title: _("OLD_ORDERS"),
            iconCls: "organize",
            layout: 'fit',

            styleHtmlContent: true,
            scrollable: true,

            items: [{
                docked: "top",
                xtype: "titlebar",
                title: _("OLD_ORDERS")
            }, {
                layout: "fit",

                items: [{
                    xtype: "label",
                    id: "orders-list-label",
                    docked: "top"
                }, {
                    xtype: 'list',
                    store: "Orders",
                    id: "orders-list",
                    onItemDisclosure: true,
                    ui: 'round',
                    itemTpl: new Ext.XTemplate(
                        '<div class="orderslist-entry"><strong>{[this.formatDate(values.submissionDate)]}</strong> <span class="right">{[this.formatNumPictures(values.pictureIds.length)]}</span></div>',
                    {
                        formatDate: function(d) {
                            return Ext.util.Format.htmlEncode(Ext.util.Format.date(d, "l, jS F Y"))
                        },
                        formatNumPictures: function(count) {
                            return Ext.String.format(_("NUM_PICTURES_FMT").toString(), count)
                        }
                    }),
                    listeners: {
                        itemtap: function() { navigator.notification.beep(1) }
                    },
                }]
            }],

            //html: "<p>orders list</p><hr/><a href=\"javascript:navigator.notification.alert('Congratulations, you are ready to work with Sencha Touch 2 and PhoneGaaaaaaaaaap!')\">Click me orders list</a>",
        }
    }
})
