console.log("order detail view")

var oldOrdersFilter = new Ext.util.Filter({
    filterFn: function(item) {
        return item.submissionDate != null
    }
})

Ext.define("MobiPrint.view.OrderDetail", {
    extend: "Ext.Panel",
    xtype: "mobiprint-orderdetail",
    config: {
        layout: "fit",
        title: "",

        scrollable: false,

        items: {
            xtype: "label",
            id: "order-detail-label",
            docked: "top"
        },
    },

    updateData: function(newData) {
        var isOldOrder = newData.submissionDate
        var label = this.down("#order-detail-label")
        label.setHtml(Ext.htmlEncode(Ext.String.format(_("ORDER_CONTAINS_N_PICTURES_FMT").toString(),
                                                       newData.pictureIds.length)))

        this.setTitle(isOldOrder ? _("OLD_ORDER") : _("CURRENT_ORDER"))

        var gridWidth = Math.floor(window.innerWidth / 90)
        var itemWidth = Math.floor((window.innerWidth - 10) / gridWidth) - 10
        var maxItemHeight = itemWidth

        // Remove old panel if any
        if(this.getItems().length > 1)
            this.remove(1)

        var panel = Ext.create("Ext.Panel", {
            layout: "vbox",
            align: "stretch",
            scrollable: true
        })
        var container, i

        for(i = 0; i < newData.pictureIds.length; ++i)
        {
            if(i % gridWidth == 0)
            {
                container = Ext.create("Ext.Container", {
                    height: maxItemHeight,
                    layout: "hbox"
                })
                panel.add(container)
            }

            container.add({
                xtype: "panel",
                flex: 1,
                html: ("<img src='" +
                       Ext.htmlEncode(WEB_SERVICE_BASE_URI + "picture/" + newData.pictureIds[i] + "/thumbnail/?size=300") +
                       "' class='order-detail-thumbnail' />")
            })
        }

        // Make grid layout equal
        if(i % gridWidth != 0)
            for(var n = 0; n < gridWidth - (i % gridWidth); ++n)
                container.add({
                    xtype: "panel",
                    flex: 1
                })

        this.add(panel)
    }
})
