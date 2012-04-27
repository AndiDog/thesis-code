var atfsys = require('uk.me.thepotters.atf.sys')
var pictureUpload = require('/lib/PictureUpload')
var SubmitOrderView = require('/ui/common/SubmitOrderView')
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

function getScaledImageDimensions(dim, cx, cy)
{
    var imageWidth, imageHeight

    if(dim.width == 0 && dim.height == 0)
    {
        // File not recognized as image
        imageWidth = cx
        imageHeight = cy
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

    return [imageWidth, imageHeight]
}

function OrderDetailView(order, isCurrentOrder)
{
    if(!(this instanceof OrderDetailView))
        return new OrderDetailView(order, isCurrentOrder)

    this.getPictureState = function(pictureId)
    {
        if(this.order.submissionDate == null)
            return 'uploaded'
        else
            return 'printed'
    }

    this.getPictureStateText = function(state)
    {
        if(state == 'printed')
            return L('printed')
        else if(state == 'uploaded')
            return L('uploaded')
        else if(state == 'uploading')
            return L('uploading')
        else
            throw "Invalid state " + state
    }

    this.recreateLayout = function()
    {
        var _this = this

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

        var numberOfOrderPictures = this.order.pictureIds.length
        var uploadingPictures = this.order.submissionDate == null ? pictureUpload.getUploadingPictures() : []
        var numberOfUploadingPictures = this.order.submissionDate == null ? uploadingPictures.length : 0

        this.headerLabel.setText(String.format(L('orderContainsNPictures'), this.order.pictureIds.length + (this.order.submissionDate == null ? pictureUpload.getUploadingPictures().length : 0)))

        this.shownState = JSON.stringify([this.order.pictureIds, uploadingPictures])
        Ti.API.debug('uploadingPictures:'+JSON.stringify(uploadingPictures)+',this.order.submissionDate==null?='+(this.order.submissionDate==null))
        var tableData = []
        var cellIndex = 0

        while(cellIndex < numberOfOrderPictures + numberOfUploadingPictures)
        {
            var rowExtra = 28
            var rowHeight = 0

            var row = Ti.UI.createTableViewRow({
                className: "thumbnail",
                layout: "horizontal",
                height: rowHeight // will be set again later (may get smaller),
            })

            for(var x = 0; x < xGrid && cellIndex < numberOfOrderPictures + numberOfUploadingPictures; ++x)
            {
                var view = Ti.UI.createView({
                    left: x == 0 ? leftmostLeft : spacing,
                    top: 0,
                    width: cx,
                    height: cy + 50, // will be set again later if images are smaller inheight
                    layout: 'vertical'
                })

                var filename, imageWidth, imageHeight
                if(cellIndex < numberOfOrderPictures)
                {
                    filename = thumbnailDownloadCache.getFilename(this.order.pictureIds[cellIndex])
                    var dim = getImageDimensions(filename)
                    var scaledDim = getScaledImageDimensions(dim, cx, cy)
                    imageWidth = scaledDim[0]
                    imageHeight = scaledDim[1]
                }
                else
                {
                    filename = uploadingPictures[cellIndex - numberOfOrderPictures]
                    imageWidth = cx
                    imageHeight = cy
                }

                view.setHeight(imageHeight + 50)
                if(imageHeight + rowExtra > rowHeight)
                    rowHeight = imageHeight + rowExtra

                var filenameExists = Ti.Filesystem.getFile(filename).exists()
                var image = Ti.UI.createImageView({
                    image: filenameExists ? filename : null,
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

                var callback = function(image, pictureId, row, rowHeight, view, view2) {
                    var eventListener

                    eventListener = function() {
                        // Have to re-create the whole layout, or else image aspect ratio is not correct (seems like TableView layouting is flawed)
                        if(image.image == null)
                        {
                            image = null
                            _this.recreateLayout()

                            // Only do this once, then release the old image instance
                            Ti.App.removeEventListener('update-thumbnail-' + pictureId, eventListener)

                            atfsys.OptimiseMemory()
                        }
                    }

                    return eventListener
                }

                if(cellIndex < numberOfOrderPictures && !Ti.Filesystem.getFile(filename).exists())
                    Ti.App.addEventListener('update-thumbnail-' + this.order.pictureIds[cellIndex], callback(image, this.order.pictureIds[cellIndex], row, rowHeight, view, view2))

                var state = cellIndex < numberOfOrderPictures ? this.getPictureState(this.order.pictureIds[cellIndex]) : 'uploading'
                Ti.API.info('cellindex:'+cellIndex+',numberOfOrderPictures='+numberOfOrderPictures+',numberOfUploadingPictures='+numberOfUploadingPictures+',staet='+state)

                var statusImage = Ti.UI.createImageView({
                    image: '/images/' + state + '.png',
                    top: 1,
                    width: 17,
                    height: 17
                })

                var label = Ti.UI.createLabel({
                    font: { fontSize: 14 },
                    text: this.getPictureStateText(state),
                    left: 5,
                    top: 0,
                    height: 'auto',
                    touchEnabled: false
                })

                setInterval(function(statusImage, label, pictureId, filename) { return function() {
                    if(pictureId == null)
                    {
                        if(!pictureUpload.isUploading(filename) && label.text != _this.getPictureStateText('uploaded'))
                        {
                            Ti.API.info('Changing uploading picture to uploaded state (' + filename + ')')
                            statusImage.setImage('/images/uploaded.png')
                            label.setText(_this.getPictureStateText('uploaded'))

                            Ti.App.fireEvent('force-order-list-update')
                        }
                    }
                    else
                    {
                        var status = _this.getPictureState(pictureId)
                        var text = _this.getPictureStateText(status)
                        if(label.text != text)
                        {
                            statusImage.setImage('/images/' + status + '.png')
                            label.setText(text)
                        }
                    }
                }}(statusImage, label, cellIndex < numberOfOrderPictures ? this.order.pictureIds[cellIndex] : null, filename), 10000)

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

        var oldTable = this.table

        this.table = Ti.UI.createTableView({
            data: tableData,
            top: 5
        })

        if(oldTable != null)
            this.window.remove(oldTable)
        this.window.add(this.table)
    }

    this.updateOrder = function(order)
    {
        var uploadingPictures = order.submissionDate == null ? pictureUpload.getUploadingPictures() : []

        this.order = order

        // Recreate UI if order changed in any way
        if(this.shownState != JSON.stringify([order.pictureIds, uploadingPictures]))
            this.recreateLayout()

        this.updateThumbnails()
    }

    this.updateThumbnails = function()
    {
        for(var i = 0; i < this.order.pictureIds.length; ++i)
        {
            setTimeout((function(pictureId) { return function() {
                thumbnailDownloadCache.downloadThumbnail(
                    pictureId,
                    function() {
                        Ti.App.fireEvent('update-thumbnail-' + pictureId)
                        Ti.API.info('Thumbnail download onSuccess callback called (id=' + pictureId + ')')
                    })
            }})(this.order.pictureIds[i]), 1)
        }
    }

    var self = Ti.UI.createWindow({
        title: L('oldOrders'),
        backgroundColor: '#000',
        layout: 'vertical'
    })

    this.window = self

    this.headerLabel = Ti.UI.createLabel({
        text: '...',
        width: Ti.UI.FILL,
        height: 'auto',
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
        touchEnabled: false
    })
    self.add(this.headerLabel)

    var _this = this

    if(isCurrentOrder)
    {
        var submitButton = Ti.UI.createButton({
            title : L('submit'),
            width: Ti.UI.FILL
        })

        submitButton.addEventListener('click', function() {
            if(_this.order.pictureIds.length > 0)
                new SubmitOrderView(_this.order).open({modal: true})
            else
                alert(L('haveToAddPicturesFirst'))
        })

        self.add(submitButton)
    }

    this.order = order
    this.table = null
    this.recreateLayout()

    Ti.Gesture.addEventListener('orientationchange', function(e) {
        // TODO: only do this if tab is active
        _this.recreateLayout()
    })

    if(order.id > 0)
        Ti.App.addEventListener('update-order-' + order.id, function(e)
        {
            Ti.API.info('update-order-' + order.id + ' called')
            _this.updateOrder(e.order)
        })

    if(isCurrentOrder)
        Ti.App.addEventListener('update-current-order', function(e)
        {
            Ti.API.info('update-current-order')
            _this.updateOrder(e.order)
        })

    this.updateThumbnails()

    return self
}

module.exports = OrderDetailView