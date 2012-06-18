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

    onFoundPictureFolder: function(path, numPictures) {
        console.log("MobiPrint.store.PictureFolders.onFoundPictureFolder(path=" + path + ")")

        var id = MobiPrint.model.PictureFolder.makeStringHash(path)
        var pictureFolder = this.getById(id)

        if(!pictureFolder)
            pictureFolder = new MobiPrint.model.PictureFolder({
                path: path,
                name: path.replace(/^.+[\/\\]/, ""),
                numPictures: numPictures,
                lastUpdate: new Date()
            })
        else
        {
            pictureFolder.set("numPictures", numPictures)
            pictureFolder.set("lastUpdate", new Date())
        }

        pictureFolder.save()

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

        if(browserDebugging)
        {
            console.log("Picture scan not supported in browser debugging mode (file API not supported, using fake picture folders)")

            this.removeAll(false)
            this.sync()

            for(var name in {"Barcelona" : 0, "München" : 0})
                new MobiPrint.model.PictureFolder({
                    path: "file:///mnt/sdcard/does/not/exist/" + name,
                    name: name,
                    numPictures: 6,
                    lastUpdate: new Date()
                }).save()
            this.sync()
            this.load()

            return
        }

        var now = new Date()
        var outdated = false
        var atLeastOne = false
        this.each(function(record) {
            atLeastOne = true

            // Update every 10 minutes at the most
            if(Math.abs(now.getTime() - record.get("lastUpdate").getTime()) > 10 * 60 * 1000)
            {
                record.erase()
                outdated = true
            }
        })

        if(!outdated && atLeastOne)
        {
            console.log("Not scanning for picture folders, last scan was recent enough")
            return
        }

        // Need timeout after removeAll call (seems to be asynchronous and causes problems if model instances are
        // inserted meanwhile)
        setTimeout(function() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT,
                                     0,
                                     function(fileSystem) {
                                         _this.scanFolder(fileSystem.root, 0)
                                     },
                                     function(err) {
                                         navigator.toast.showLongToast("Failed to read file system (error code " + err.code  +")")
                                     })
        }, 12500)

        console.log("MobiPrint.store.PictureFolders.rescanPictureFolders()~")
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
                else if(entries[i].isFile && /\.jpg$/.test(entries[i].isFile && entries[i].fullPath))
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
        console.log("MobiPrint.store.PictureFolders.scanSingleFolderAsync()")

        if(browserDebugging)
        {
            var filenames = ["resources/icons/Icon.png",
                             "resources/icons/Icon.png",
                             "resources/icons/Icon.png",
                             "resources/icons/Icon.png",
                             "resources/icons/Icon.png",
                             "resources/icons/Icon.png"]

            setTimeout(function() { callback(filenames) }, 0)
        }
        else
        {
            // getDirectory doesn't like the file:// prefix
            path = path.replace(/file:\/\//, "")

            window.requestFileSystem(
                LocalFileSystem.PERSISTENT,
                0,
                function(fileSystem) {
                    fileSystem.root.getDirectory(
                        path,
                        {create: false},
                        function(dirEntry) {
                            dirEntry.createReader().readEntries(function(entries) {
                                var filenames = []

                                for(var i = 0; i < entries.length; ++i) {
                                    if(entries[i].isFile && /\.jpg$/.test(entries[i].isFile && entries[i].fullPath))
                                        filenames.push(entries[i].fullPath)
                                }

                                setTimeout(function() { callback(filenames) }, 0)
                            }, function(err) {
                                console.log("Failed to read directory entries of " + dirEntry.fullPath + " (error code " + err.code  +")")
                                navigator.toast.showLongToast("Failed to read directory entries (error code " + err.code  +")")
                            })
                        },
                        function(err) {
                            navigator.toast.showLongToast("Failed to read " + path + " (error code " + err.code  +")")
                        }
                    )
                },
                function(err) {
                    navigator.toast.showLongToast("Failed to read file system (error code " + err.code  +")")
                }
            )
        }

        console.log("MobiPrint.store.PictureFolders.scanSingleFolderAsync()~")
    }
})
