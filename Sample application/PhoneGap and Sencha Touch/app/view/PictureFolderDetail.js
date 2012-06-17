Ext.define("MobiPrint.view.PictureFolderDetail", {
    extend: "Ext.Panel",
    requires: ["Ext.Img"],
    xtype: "mobiprint-picturefolderdetail",
    config: {
        layout: "fit",
        title: "",

        scrollable: false,

        items: {
            xtype: "panel",
            layout: "vbox",
            align: "stretch",
            pack: "center",
            scrollable: true,
            // Extra panel so that scrolling works (seems like scrollable container must have exactly one child whose
            // height is measurable)
            items: { xtype: "panel" }
        }
    },

    createLayout: function() {
        var pictureFolder = this.data.pictureFolder

        this.setTitle(_("ADD_PICTURES") + ": <i>" + Ext.htmlEncode(pictureFolder.name) + "</i>")
    },

    setPictureFilenames: function(filenames) {
        var panel = this.down("panel > panel")

        for(var i = 0; i < filenames.length; ++i)
        {
            panel.add({
                xtype: "panel",
                layout: "hbox",
                items: {
                    xtype: "panel",
                    // TODO: file:// prefix?!
                    html: "<div style='text-align: center'><img class='picture-folder-file' src='" + Ext.htmlEncode(filenames[i]) + "'/></div>"
                }
            })

            // TODO: add checkbox
            panel.add({
                xtype: "panel",
                layout: "hbox",
                items: [{
                    xtype: "label",
                    html: _("SELECT_PICTURE_FOR_PRINTING")
                }]
            })
        }
    },

    updateData: function(newData) {
        if(this.data !== undefined)
            throw "Can only set data for PictureFolderDetail view once"

        this.data = newData
        this.createLayout()
    }
})
