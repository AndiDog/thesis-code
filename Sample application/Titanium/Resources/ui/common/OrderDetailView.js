function OrderDetailView()
{
    if(!(this instanceof OrderDetailView))
        return new OrderDetailView()

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
        Ti.API.info('leftmostLeft:'+leftmostLeft)

        var numberOfPictures = this.numberOfPictures

        var tableData = []

        var colorSet = ["#D44646",
                        "#46D463",
                        "#46D4BE",
                        "#C2D446",
                        "#D446D5",
                        "#4575D5",
                        "#E39127",
                        "#879181",
                        "#E291D4"]

        var colorSetIndex = 0
        var cellIndex = 0

        while(cellIndex < numberOfPictures)
        {
            var rowHeight = cy + 28

            var row = Ti.UI.createTableViewRow({
                className: "thumbnail",
                layout: "horizontal",
                height: rowHeight
            })

            for(var x = 0; x < xGrid && cellIndex < numberOfPictures; ++x)
            {
                var view = Ti.UI.createView({
                    left: x == 0 ? leftmostLeft : spacing,
                    top: 0,
                    width: cx,
                    height: cy + 50,
                    layout: 'vertical'
                })

                var image = Ti.UI.createImageView({
                    customData: cellIndex.toString(),
                    image: '/images/test-thumbnail.jpg',
                    width: cx,
                    height: cy
                })

                var view2 = Ti.UI.createView({
                    left: 0,
                    top: 0,
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
                    height: 'auto'
                })

                view.add(image)
                view2.add(statusImage)
                view2.add(label)
                view.add(view2)

                row.add(view)

                ++cellIndex;
                ++colorSetIndex;

                if(colorSetIndex >= colorSet.length)
                    colorSetIndex = 0
            }

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

    this.numberOfPictures = 50

    this.headerLabel = Ti.UI.createLabel({
        text: String.format(L('orderContainsNPictures'), this.numberOfPictures),
        //font: { fontSize: 14 },
        width: Ti.UI.FILL,
        height: 'auto',
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT
    })
    self.add(this.headerLabel)

    this.table = null
    this.recreateLayout()

    var _this = this

    Ti.Gesture.addEventListener('orientationchange', function(e) {
        // TODO: only do this if tab is active
        _this.recreateLayout()
    })

    return self
}

module.exports = OrderDetailView