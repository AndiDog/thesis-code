function AddPicturesFromFolderView(filenames)
{
    if(!(this instanceof AddPicturesFromFolderView))
        return new AddPicturesFromFolderView(path)

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

            checkbox.addEventListener('change', function(filename) { return function(e) {
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

    this.filenames = filenames

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