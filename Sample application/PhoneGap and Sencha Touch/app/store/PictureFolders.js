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

    onFoundPictureFolder: function(path, numPictures) {
        // ID is set automatically by model in a way that no duplicates are saved
        new MobiPrint.model.PictureFolder({
            path: path,
            name: path.replace(/^.+[\/\\]/, ""),
            numPictures: numPictures
        }).save()

        if(!this.syncingNewFolders)
        {
            this.syncingNewFolders = true

            var _this = this
            setTimeout(function() {
                _this.syncingNewFolders = false

                _this.sync()
                _this.load()
                console.log("Loaded picture folders")
            }, 1500)
        }

        console.log("MobiPrint.store.PictureFolders.onFoundPictureFolder(path=" + path + ")~")
    },

    rescanPictureFolders: function() {
        console.log("MobiPrint.store.PictureFolders.rescanPictureFolders()")

        var _this = this

        if(!window.requestFileSystem)
        {
            console.log("File API not supported, ignoring")
            return
        }

        // Silent so that "clear" event does not get called (hope this keeps the list view intact)
        this.removeAll(true)

        window.requestFileSystem(LocalFileSystem.PERSISTENT,
                                 0,
                                 function(fileSystem) {
                                     _this.scanFolder(fileSystem.root, 0)
                                 },
                                 function(err) {
                                     navigator.toast.showLongToast("Failed to read file system (error code " + err.code  +")")
                                 })
    },

    scanFolder: function(dirEntry, depth) {
        if(depth > 3)
            return

        var _this = this

        var directoryReader = dirEntry.createReader()

        directoryReader.readEntries(function(entries) {
            var numPictures = 0

            for(var i = 0; i < entries.length; ++i) {
                if(entries[i].isDirectory)
                    _this.scanFolder(entries[i], depth + 1)
                else if(/\.jpg$/.test(entries[i].isFile && entries[i].fullPath))
                    ++numPictures
            }

            if(numPictures > 0)
                _this.onFoundPictureFolder(dirEntry.fullPath, numPictures)
        }, function(err) {
            if(!/secure/.test(dirEntry.fullPath))
            {
                console.log("Failed to read directory entries of " + dirEntry.fullPath + " (error code " + err.code  +")")
                console.log(Ext.JSON.encode(err))
                navigator.toast.showLongToast("Failed to read directory entries (error code " + err.code  +")")
            }
        })
    },

    scanSingleFolderAsync: function(path, callback) {
        var filenames = ["resources/icons/Icon.png",
                         "resources/icons/Icon.png",
                         "resources/icons/Icon.png",
                         "resources/icons/Icon.png",
                         "resources/icons/Icon.png",
                         "resources/icons/Icon.png"]

        setTimeout(function() { callback(filenames) }, 0)
    }
})
