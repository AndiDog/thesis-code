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

    destroy: function() {
        this.callParent()

        // Avoid memory leak used by reference to method
        Ext.Viewport.removeListener("orientationchange", this.redraw, this)
    },

    initialize: function() {
        Ext.Viewport.addListener("orientationchange", this.redraw, this)
    },

    redraw: function() {
        var order = this.data.order
        var uploadingPictures
        var numUploadingPictures = 0
        var isOldOrder = order.submissionDate
        var label = this.down("#order-detail-label")
        label.setHtml(Ext.htmlEncode(Ext.String.format(_("ORDER_CONTAINS_N_PICTURES_FMT").toString(),
                                                       order.pictureIds.length)))

        if(!isOldOrder)
        {
            uploadingPictures = []

            for(var key in this.data.uploadingPictures)
            {
                uploadingPictures.push(key)
                ++numUploadingPictures
            }
        }

        this.setTitle(Ext.htmlEncode(isOldOrder ? _("OLD_ORDER") : _("CURRENT_ORDER")))

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

        for(i = 0; i < order.pictureIds.length + numUploadingPictures; ++i)
        {
            if(i % gridWidth == 0)
            {
                container = Ext.create("Ext.Container", {
                    height: maxItemHeight,
                    layout: "hbox"
                })
                panel.add(container)
            }

            var pictureId = i < order.pictureIds.length ? order.pictureIds[i] : null
            var uploadingFilename = i < order.pictureIds.length ? null : uploadingPictures[i - order.pictureIds.length]
            var imageSrc
            var status, statusText
            var statusText
            if(isOldOrder)
                status = "printed"
            else
                status = pictureId == null ? "uploading" : "uploaded"

            if(pictureId)
                imageSrc = WEB_SERVICE_BASE_URI + "picture/" + order.pictureIds[i] + "/thumbnail/?size=300"
            else
                imageSrc = uploadingFilename

            statusText = _(status.toUpperCase()) // "UPLOADED", "UPLOADING", "PRINTED"

            container.add({
                xtype: "container",
                align: "stretch",
                pack: "start",
                layout: "vbox",
                flex: 1,
                items: [{
                    xtype: "panel",
                    layout: "fit",
                    html: ("<img src='" +
                           Ext.htmlEncode(imageSrc) +
                           "' class='order-detail-thumbnail' />")
                }, {
                    xtype: "panel",
                    html: "<p class='order-detail-status'><img src='resources/images/" + status + ".png'/> <span>" + Ext.htmlEncode(statusText) + "</span></p>"
                }]
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
    },

    updateData: function(newData) {
        this.data = newData
        this.redraw()
    }
})
