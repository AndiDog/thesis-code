function AddPicturesTab()
{
    if(!(this instanceof AddPicturesTab))
        return new AddPicturesTab()

    this.updateFoldersList = function()
    {
        var tableData = []

        this.table.setHeaderTitle(String.format(L('pictureFoldersInTotal'), this.folders.length))

        // Clear table entries
        this.table.setData([])

        for(var i = 0; i < this.folders.length; ++i)
        {
            var folder = this.folders[i]

            var row = Titanium.UI.createTableViewRow({
                customData: {path: folder.path},
                hasDetail: true
            })

            var labelLeft = Ti.UI.createLabel({
                left: 10,
                text: folder.path.replace(/.+[\/\\]/, '')
            })
            var labelRight = Ti.UI.createLabel({
                right: 10,
                text: String.format(L('numPictures'), folder.pictureCount)
            })

            row.add(labelLeft)
            row.add(labelRight)
            this.table.appendRow(row)
        }
    }

    this.folders = [{path: '/mnt/sdcard/Pictures/Barcelona', pictureCount: 173},
                    {path: '/mnt/sdcard/Pictures\\Bandon', pictureCount: 0}]

    var self = Ti.UI.createWindow({
        title: L('addPictures'),
        backgroundColor: '#000'
    });

    this.table = new Titanium.UI.createTableView({
        headerTitle: '...',
        scrollable: true
    })

    this.table.addEventListener('click', function(e) {
        if(!e.row || !e.row.customData)
            return

        var path = e.row.customData.path

        Ti.API.info('Clicked on '+path)

        var AddPicturesFromFolderView = require('/ui/common/AddPicturesFromFolderView')
        var view = new AddPicturesFromFolderView(path)

        view.open()
    })

    self.add(this.table)

    this.updateFoldersList()

    this.window = self

    return self
}

module.exports = AddPicturesTab