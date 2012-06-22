Ext.define("MobiPrint.controller.PictureFolders", {
    extend: "Ext.app.Controller",

    statics: {
        getUploadingPictures: function() {
            if(!this.uploadingPictures)
                throw "Invalid scope"

            return this.uploadingPictures
        },

        // Initially empty
        uploadingPictures: {}
    },

    config: {
        refs: {
            addPicturesButton: "#add-pictures-button",
            detailView: "mobiprint-picturefolderdetail",
            tabs: "#tabs",
            pictureFoldersListNavigationView: "#picturefolderslist-navigationview"
        },
        control: {
            "#picturefolders-list": {
                itemtap: "onDisclosePictureFolder"
            },
            "mobiprint-picturefolderslist": {
                show: "onListShow"
            },
            "#add-pictures-button": {
                tap: "onAddPictures"
            }
        }
    },

    onAddPictures: function() {
        var checkboxes = this.getDetailView().query("checkboxfield")
        var atLeastOneChecked = false
        var filenames = []

        for(var i = 0; i < checkboxes.length; ++i)
        {
            var checkbox = checkboxes[i]

            if(!checkbox.isChecked())
                continue

            var name = checkbox.getName()

            if(!/^picture-/.test(name))
                throw "Assertion failed: Checkbox name"

            var filename = name.substr(8)

            filenames.push(filename)
        }

        var _this = this
        for(var i = 0; i < filenames.length; ++i)
        {
            setTimeout((function(filename) { return function() {
                _this.uploadPicture(filename)
            }})(filenames[i]), i * 250)
        }

        if(!filenames.length)
            alert(_("NO_PICTURES_SELECTED"))
        else
        {
            this.getPictureFoldersListNavigationView().pop()

            // Switch to current order tab
            this.getTabs().setActiveItem(2)

            setTimeout(function() {
                alert(Ext.String.format(_("NUM_PICTURES_TO_UPLOAD_FMT"), filenames.length))
            }, 1000)
        }
    },

    onDisclosePictureFolder: function(list, index, target, record) {
        this.showPictureFolderDetail(record.data)
    },

    onListShow: function() {
        this.getAddPicturesButton().hide()
    },

    launch: function() {
        console.log("MobiPrint.controller.PictureFolders.launch()")

        setTimeout(function() {
            Ext.getStore("PictureFolders").rescanPictureFolders()
        }, 2000)

        console.log("MobiPrint.controller.PictureFolders.launch()~")
    },

    showPictureFolderDetail: function(pictureFolder) {
        this.getAddPicturesButton().show()

        var pictureFolderDetailView = Ext.create("MobiPrint.view.PictureFolderDetail")
        var viewData = {pictureFolder: pictureFolder}
        pictureFolderDetailView.setData(viewData)
        this.getPictureFoldersListNavigationView().push(pictureFolderDetailView)

        var _this = this
        Ext.getStore("PictureFolders").scanSingleFolderAsync(pictureFolder.path, function(filenames) {
            pictureFolderDetailView.setPictureFilenames(filenames)
        })
    },

    uploadPicture: function(filename) {
        var app = this.getInitialConfig("application")
        var uploadingPictures = MobiPrint.controller.PictureFolders.getUploadingPictures()

        if(filename in uploadingPictures)
        {
            console.log("Ignoring picture upload of " + filename + ", already uploading")
            return
        }

        if(/^file:\/\//.test(filename))
            filename = filename.substr(7)

        var pureFilename = filename.replace(/^.*[\/\\]/, "")

        var options = new FileUploadOptions()
        options.fileKey = "picture"
        options.fileName = pureFilename
        options.mimeType = "image/jpeg"
        options.chunkedMode = false

        var _this = this

        var success = function(response) {
            app.fireEvent("picture-upload-finished")
            delete uploadingPictures[filename]

            var store = Ext.getStore("Orders")
            var newCurrentOrder = Ext.JSON.decode(response.response)["order"]
            var order = store.getById(newCurrentOrder.id)

            if(!order)
                return

            order.set({pictureIds: newCurrentOrder.pictureIds,
                       storeId: newCurrentOrder.storeId,
                       submissionDate: newCurrentOrder.submissionDate})

            order.save()
            store.sync()
        }
        var failure = function(error) {
            app.fireEvent("picture-upload-finished")
            delete uploadingPictures[filename]

            toast.showLongToast("Failed to upload " + filename)
        }

        // Uses POST method (multipart-encoded)
        var transfer = new FileTransfer()

        uploadingPictures[filename] = true
        app.fireEvent("picture-upload-started")
        transfer.upload(filename, WEB_SERVICE_BASE_URI + "pictures/put-by-post-workaround/", success, failure, options)
    }
})
