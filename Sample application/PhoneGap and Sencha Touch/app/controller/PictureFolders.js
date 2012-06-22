Ext.define("MobiPrint.controller.PictureFolders", {
    extend: "Ext.app.Controller",

    config: {
        refs: {
            addPicturesButton: "#add-pictures-button",
            detailView: "mobiprint-picturefolderdetail",
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
        if(/^file:\/\//.test(filename))
            filename = filename.substr(7)

        var pureFilename = filename.replace(/^.*[\/\\]/, "")

        var options = new FileUploadOptions()
        options.fileKey = "picture"
        options.fileName = pureFilename
        options.mimeType = "image/jpeg"
        options.chunkedMode = false

        var success = function(response) {
            var store = Ext.getStore("Orders")
            var newCurrentOrder = Ext.JSON.decode(response.response)["order"]
            var order = store.getById(newCurrentOrder.id)

            if(!order)
                return

            // TODO: bind changes in current order or any order to change the current order view
            /*store.addListener("updaterecord", function(store, record, newIndex, oldIndex, modifiedFieldNames) {
                alert("UPDATERECORD")
                alert(record.get("id"))
                alert(record.get("submissionDate"))
                alert(Ext.JSON.encode(record.data))
            })*/

            order.set({pictureIds: newCurrentOrder.pictureIds,
                       storeId: newCurrentOrder.storeId,
                       submissionDate: newCurrentOrder.submissionDate})

            order.save()
            store.sync()
        }
        var failure = function(error) {
            toast.showLongToast("Failed to upload " + filename)
        }

        // Uses POST method (multipart-encoded)
        var transfer = new FileTransfer()

        transfer.upload(filename, WEB_SERVICE_BASE_URI + "pictures/put-by-post-workaround/", success, failure, options)
    }
})
