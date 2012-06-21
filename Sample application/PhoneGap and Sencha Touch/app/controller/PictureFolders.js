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

        for(var i = 0; i < checkboxes.length; ++i)
        {
            var checkbox = checkboxes[i]
            var name = checkbox.getName()

            if(!/^picture-/.test(name))
                throw "Assertion failed: Checkbox name"

            var filename = name.substr(8)

            alert(checkbox.isChecked())
        }
        //this.getPictureFoldersListNavigationView().pop()
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
    }
})
