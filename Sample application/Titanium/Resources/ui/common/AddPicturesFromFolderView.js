var pictureUpload = require('/lib/PictureUpload')

function AddPicturesFromFolderView(folderPath, filenames)
{
    if(!(this instanceof AddPicturesFromFolderView))
        return new AddPicturesFromFolderView(folderPath, filenames)

    this.updatePictures = function()
    {
        var tableData = []

        var filenames = this.filenames

        for(var i = 0; i < filenames.length; ++i)
        {
            var filename = filenames[i]

            var image = Ti.UI.createImageView({
                image: filename,
                defaultImage: '/images/test-thumbnail.jpg',
                top: i == 0 ? 5 : 20
            })

            var row = Ti.UI.createTableViewRow({
                layout: 'vertical'
            })

            var view = Ti.UI.createView({
                layout: 'horizontal'
            })

            var label = Ti.UI.createLabel({
                text: L('selectForPrinting'),
                touchEnabled: false,
                left: 10
            })

            var checkbox = Ti.UI.createSwitch({
                left: 15,
                style: Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
                value: false
            })

            var _this = this
            checkbox.addEventListener('change', function(filename) { return function(e) {
                _this.selectedFilenames[filename] = e.value

                if(e.value)
                    Ti.API.info('Selected picture ' + filename)
                else
                    Ti.API.info('Deselected picture ' + filename)
            }}(filename))

            row.add(image)
            view.add(label)
            view.add(checkbox)
            row.add(view)

            this.table.appendRow(row)
        }
    }

    var _this = this

    this.filenames = filenames
    this.selectedFilenames = {}

    var self = Ti.UI.createWindow({
        title: String.format(L('addPicturesFromFolderX'), /[^\/\\]+$/.exec(folderPath)[0]),
        backgroundColor: '#000'
    })

    this.table = Ti.UI.createTableView({
        scrollable: true,
        touchEnabled: false
    })

    var backButton = Ti.UI.createButton({
        title: L('back'),
        left: 10
    })
    backButton.addEventListener('click', function() {
        self.close()
    })

    var horizontalView  = Ti.UI.createView({
        layout: 'absolute',
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE
    })

    var addButton = Ti.UI.createButton({
        title: L('addToOrder'),
        right: 10,
        width: 160
    })
    addButton.addEventListener('click', function() {
        Ti.API.info('Add button clicked')

        var count = 0

        for(var filename in _this.selectedFilenames)
            if(_this.selectedFilenames[filename])
            {
                ++count
                Ti.API.info('Will upload selected picture ' + filename)
                setTimeout(function(filename) { return function() {
                    pictureUpload.upload(filename)
                }}(filename), 20)
            }

        if(!count)
            alert(L('noPicturesSelected'))
        else
        {
            self.close()

            setTimeout(function() {
                alert(String.format(L('willUploadNPictures'), count))

                Ti.App.fireEvent('switch-to-current-order')
            }, 500)
        }
    })

    var verticalView = Ti.UI.createView({
        layout: 'vertical'
    })
    horizontalView.add(backButton)
    horizontalView.add(addButton)
    verticalView.add(horizontalView)
    verticalView.add(this.table)
    self.add(verticalView)

    this.updatePictures()

    return self
}

module.exports = AddPicturesFromFolderView