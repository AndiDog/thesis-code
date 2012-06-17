Ext.define("MobiPrint.controller.PictureFolders", {
    extend: "Ext.app.Controller",

    config: {
        refs: {
            pictureFoldersListNavigationView: "#picturefolderslist-navigationview"
        },
        control: {
            "#picturefolders-list": {
                itemtap: "onDisclosePictureFolder"
            }
        }
    },

    onDisclosePictureFolder: function(list, index, target, record) {
        this.showPictureFolderDetail(record.data)
    },

    launch: function() {
        setTimeout(function() {
            Ext.getStore("PictureFolders").rescanPictureFolders()
        }, 2000)
    },

    showPictureFolderDetail: function(pictureFolder) {
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
