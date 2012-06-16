Ext.define("MobiPrint.controller.PictureFolders", {
    extend: "Ext.app.Controller",

    launch: function() {
        setTimeout(function() {
            Ext.getStore("PictureFolders").rescanPictureFolders()
        }, 2000)
    }
})
