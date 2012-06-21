Ext.define("MobiPrint.view.PictureFolderDetail", {
    extend: "Ext.Panel",
    requires: [
        "Ext.Img",
        "Ext.form.Panel"
    ],
    xtype: "mobiprint-picturefolderdetail",
    config: {
        layout: "fit",
        title: "",

        scrollable: false,

        items: {
            xtype: "formpanel",
            layout:"vbox",

            scrollable: true,
            items: {
                xtype:"panel"
            }
        }
    },

    createLayout: function() {
        var pictureFolder = this.data.pictureFolder

        this.setTitle(_("ADD_PICTURES") + ": <i>" + Ext.htmlEncode(pictureFolder.name) + "</i>")
    },

    setPictureFilenames: function(filenames) {
        var panel = this.down("formpanel > panel")

        for(var i = 0; i < filenames.length; ++i)
        {
            panel.add({
                xtype: "panel",
                layout: "vbox",
                align: "stretch",
                items: {
                    xtype: "panel",
                    // TODO: file:// prefix?!
                    html: "<div class='picture-folder-file'><img  src='" + Ext.htmlEncode(filenames[i]) + "'/></div>"
                }
            })

            panel.add({
                xtype: "panel",
                layout: "vbox",

                items: {
                    xtype: "checkboxfield",
                    cls: "picture-folder-file-checkbox",
                    name: "picture-" + filenames[i],
                    value: "true",
                    label: _("SELECT_PICTURE_FOR_PRINTING")
                }
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
