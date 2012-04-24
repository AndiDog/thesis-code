function AddPicturesFromFolderView(path)
{
    if(!(this instanceof AddPicturesFromFolderView))
        return new AddPicturesFromFolderView(path)

    this.updatePictures = function()
    {
        var tableData = []

        // TODO: replace test data
        var filenames = ['file:///mnt/sdcard/Download/W5GJ3.jpg',
                         'file:///mnt/sdcard/Download/W5GJ3.jpg',
                         'file:///mnt/sdcard/Download/W5GJ3.jpg',
                         'file:///mnt/sdcard/Download/W5GJ3.jpg']

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
                text: 'Select image for printing:',
                touchEnabled: false
            })

            var checkbox = Ti.UI.createSwitch({
                left: 15,
                style: Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
                value: false
            })

            row.add(image)
            view.add(label)
            view.add(checkbox)
            row.add(view)

            this.table.appendRow(row)
        }
    }

    this.path = path

    var self = Ti.UI.createWindow({
        title: L('addPictures'),
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
        title: L('add'),
        right: 10,
        width: 100
    })
    addButton.addEventListener('click', function() {
        Ti.API.info('Add button clicked')
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