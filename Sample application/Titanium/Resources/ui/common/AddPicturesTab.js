var pictureScanner = require('/lib/PictureScanner')

function AddPicturesTab()
{
    if(!(this instanceof AddPicturesTab))
        return new AddPicturesTab()

    this.updateFoldersList = function()
    {
        var tableData = []

        var folderCount = 0
        for(var key in this.folders)
            ++folderCount

        this.table.setHeaderTitle(String.format(L('pictureFoldersInTotal'), folderCount))

        // Clear table entries
        this.table.setData([])

        for(var folderPath in this.folders)
        {
            var row = Titanium.UI.createTableViewRow({
                customData: {path: folderPath},
                hasDetail: true
            })

            var labelLeft = Ti.UI.createLabel({
                left: 10,
                text: /[^\/\\]+$/.exec(folderPath)[0]
            })
            var labelRight = Ti.UI.createLabel({
                right: 10,
                text: String.format(L('numPictures'), this.folders[folderPath])
            })

            row.add(labelLeft)
            row.add(labelRight)
            this.table.appendRow(row)
        }
    }

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

        Ti.API.info('Clicked on picture folder with path ' + path)

        var AddPicturesFromFolderView = require('/ui/common/AddPicturesFromFolderView')

        var scanResults = {}
        pictureScanner.scanSingleDirectory(path, scanResults, 1)
        var view = new AddPicturesFromFolderView(path, scanResults[path])

        view.open({modal: true})
    })

    self.add(this.table)

    this.window = self

    var _this = this
    setTimeout(function() {
        // path -> number of pictures
        _this.folders = pictureScanner.scan()

        _this.updateFoldersList()
    }, 1000)

    return self
}

module.exports = AddPicturesTab