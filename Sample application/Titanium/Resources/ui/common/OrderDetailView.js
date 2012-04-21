var thumbnailDownloadCache = require('/lib/ThumbnailDownloadCache')
var imageDimensionsCache = {}

function getImageDimensions(filename)
{
    if(filename in imageDimensionsCache)
        return imageDimensionsCache[filename]

    if(!Ti.Filesystem.getFile(filename).exists())
        return {width: 0, height: 0}

    var view = Ti.UI.createImageView({
        image: filename,
        width: 'auto',
        height: 'auto'
    })
    var img = view.toImage()

    ret = {width: img.width, height: img.height}
    imageDimensionsCache[filename] = ret
    return ret
}

function OrderDetailView(order)
{
    if(!(this instanceof OrderDetailView))
        return new OrderDetailView(order)

    this.recreateLayout = function()
    {
        if(this.table != null)
            this.window.remove(this.table)

        var width = Ti.Platform.displayCaps.getPlatformWidth()
        var spacing = 5
        var cx = 95
        var xGrid = Math.floor((width - 20) / (cx + spacing))

        // Correct thumbnail size according to number of pictures on X axis
        cx = Math.floor(width / xGrid) - spacing

        // Image height
        var cy = cx

        // Center all pictures horizontally by applying correct 'left' position to left-most picture (assumes xGrid > 1)
        leftmostLeft = Math.floor((width - ((xGrid - 1) * (cx + spacing) + cx)) / 2)

        var numberOfPictures = this.order.pictureIds.length

        var tableData = []
        var cellIndex = 0

        while(cellIndex < numberOfPictures)
        {
            var rowExtra = 28
            var rowHeight = 0

            var row = Ti.UI.createTableViewRow({
                className: "thumbnail",
                layout: "horizontal",
                height: rowHeight // will be set again later (may get smaller)
            })

            for(var x = 0; x < xGrid && cellIndex < numberOfPictures; ++x)
            {
                var view = Ti.UI.createView({
                    left: x == 0 ? leftmostLeft : spacing,
                    top: 0,
                    width: cx,
                    height: cy + 50, // will be set again later if images are smaller inheight
                    layout: 'vertical'
                })

                var filename = thumbnailDownloadCache.getFilename(this.order.pictureIds[cellIndex])
                var dim = getImageDimensions(filename)
                var imageWidth, imageHeight

                if(dim.width == 0 && dim.height == 0)
                {
                    // File not recognized as image
                    imageWidth = cx
                    imageHeight = cy

                    Ti.API.error('Could not read image ' + filename)
                }
                else if(dim.width > dim.height)
                {
                    imageWidth = cx
                    imageHeight = Math.round(cx * dim.height / dim.width)
                }
                else
                {
                    imageHeight = cy
                    imageWidth = Math.round(cy * dim.width / dim.height)
                }

                view.setHeight(imageHeight + 50)
                if(imageHeight + rowExtra > rowHeight)
                    rowHeight = imageHeight + rowExtra

                var image = Ti.UI.createImageView({
                    customData: cellIndex.toString(),
                    image: filename,
                    defaultImage: '/images/test-thumbnail.jpg',
                    top: 0,
                    width: imageWidth,
                    height: imageHeight
                })

                var view2 = Ti.UI.createView({
                    left: 0,
                    width: cx,
                    layout: 'horizontal'
                })

                var statusImage = Ti.UI.createImageView({
                    image: '/images/uploaded.png',
                    top: 1,
                    width: 17,
                    height: 17
                })

                var label = Ti.UI.createLabel({
                    font: { fontSize: 14 },
                    text: 'Picture #' + cellIndex.toString(),
                    left: 5,
                    top: 0,
                    height: 'auto',
                    touchEnabled: false
                })

                view.add(image)
                view2.add(statusImage)
                view2.add(label)
                view.add(view2)

                row.add(view)

                ++cellIndex;
            }

            row.setHeight(rowHeight)
            tableData.push(row)
        }

        this.table = Ti.UI.createTableView({
            data: tableData,
            top: 5
        })

        this.table.addEventListener("click", function(e) {
            if(e.source.customData)
                Ti.API.info("Image " + e.source.customData + " was clicked!")
        })

        this.window.add(this.table)
    }

    var self = Ti.UI.createWindow({
        title: L('oldOrders'),
        backgroundColor: '#000',
        layout: 'vertical'
    })

    this.window = self

    this.headerLabel = Ti.UI.createLabel({
        text: String.format(L('orderContainsNPictures'), order.pictureIds.length),
        width: Ti.UI.FILL,
        height: 'auto',
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
        touchEnabled: false
    })
    self.add(this.headerLabel)

    this.order = order
    this.table = null
    this.recreateLayout()

    var _this = this

    Ti.Gesture.addEventListener('orientationchange', function(e) {
        // TODO: only do this if tab is active
        _this.recreateLayout()
    })

    for(var i = 0; i < order.pictureIds.length; ++i)
    {
        setTimeout((function(pictureId) { return function() {
            thumbnailDownloadCache.downloadThumbnail(
                pictureId,
                function() {
                    Ti.API.info('Thumbnail download onSuccess callback called (id=' + pictureId + ')')
                })
        }})(order.pictureIds[i]), 1)
    }

    return self
}

module.exports = OrderDetailView