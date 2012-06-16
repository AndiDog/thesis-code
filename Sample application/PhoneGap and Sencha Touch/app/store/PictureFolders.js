Ext.define("MobiPrint.store.PictureFolders", {
    extend: "Ext.data.Store",
    requires: [
        "Ext.util.JSON",
        "MobiPrint.model.PictureFolder",
        "Ext.data.proxy.LocalStorage"
    ],
    config: {
        model: "MobiPrint.model.PictureFolder",
        sorters: "name",
        autoLoad: true
    },

    initialize: function() {
        this.rescanPictureFolders()
    },

    rescanPictureFolders: function() {
        // TODO: actually scan filesystem

        new MobiPrint.model.PictureFolder({
            path: "/some/path",
            name: "Some name",
            numPictures: 182
        }, "/some/path").save()

        this.sync()
    }
})
