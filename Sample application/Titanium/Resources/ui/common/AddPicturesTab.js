var pictureScanner = require('/lib/PictureScanner')

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
                text: /[^\/\\]+$/.exec(folder.path)[0]
            })
            var labelRight = Ti.UI.createLabel({
                right: 10,
                text: String.format(L('numPictures'), folder.pictureFilenames.length)
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
        pictureScanner.scanSingleDirectory(path, scanResults)
        var view = new AddPicturesFromFolderView(scanResults[path])

        view.open({modal: true})
    })

    self.add(this.table)

    this.window = self

    var _this = this
    setTimeout(function() {
        var scanResults = pictureScanner.scan()

        _this.folders = []

        for(var directory in scanResults)
            _this.folders.push({path: directory, pictureFilenames: scanResults[directory]})

        _this.updateFoldersList()
    }, 1000)

    return self
}

module.exports = AddPicturesTab