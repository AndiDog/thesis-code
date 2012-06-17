Ext.define("MobiPrint.view.PictureFoldersList", {
    extend: "Ext.Panel",
    xtype: "mobiprint-picturefolderslist",
    requires: [
        "Ext.Label",
        "Ext.dataview.List"
    ],

    config: {
        layout: "fit",
        title: _("ADD_PICTURES"),

        items: {
            layout: "fit",

            styleHtmlContent: true,
            scrollable: true,

            items: [{
                xtype: "label",
                docked: "top",
                html: _("SELECT_FOLDER_WITH_PICTURES")
            }, {
                xtype: 'list',
                store: "PictureFolders",
                id: "picturefolders-list",
                onItemDisclosure: true,
                disableSelection: true,
                ui: 'round',
                itemTpl: new Ext.XTemplate(
                    '<div><strong>{name}</strong> <span class="right">{[this.formatNumPictures(values.numPictures)]}</span></div>',
                {
                    formatNumPictures: function(count) {
                        return Ext.String.format(_("NUM_PICTURES_FMT"), count)
                    }
                }),
            }]
        }
    }
})
