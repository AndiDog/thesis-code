function SubmitOrderView(order)
{
    if(!(this instanceof SubmitOrderView))
        return new SubmitOrderView(order)

    this.updateSearchBar = function()
    {
        var foundStores = [
            {id: 1, name: "Walmart", "address": "Marienplatz 1, München"},
            {id: 2, name: "LITTLE", "address": "Leopoldstra\u00dfe 144, M\u00fcnchen"}
        ]

        var storeIds = {}

        for(var i = 0; i < foundStores.length && i < 5; ++i)
        {
            var store = foundStores[i]
            storeIds[store.id] = true

            var found = false
            var existingRowsCount = this.pickUpLocationsTable.data.length ? this.pickUpLocationsTable.data[0].rows.length : 0
            for(var j = existingRowsCount - 1; j >= 0; --j)
                if(this.pickUpLocationsTable.data[0].rows[j].customData && this.pickUpLocationsTable.data[0].rows[j].customData.storeId == store.id)
                {
                    found = true
                    break
                }

            if(found)
                continue

            var row = Ti.UI.createTableViewRow({
                className: "store",
                layout: "vertical",
                customData: {storeId: store.id}
            })

            var labelName = Ti.UI.createLabel({
                left: 10,
                text: store.name,
                touchEnabled: false,
                font: {fontWeight: 'bold'}
            })
            var labelAddress = Ti.UI.createLabel({
                right: 10,
                text: store.address,
                touchEnabled: false
            })

            row.add(labelName)
            row.add(labelAddress)
            this.pickUpLocationsTable.appendRow(row)
        }

        var existingRowsCount = this.pickUpLocationsTable.data.length ? this.pickUpLocationsTable.data[0].rows.length : 0
        for(var i = existingRowsCount - 1; i >= 0; --i)
            if(this.pickUpLocationsTable.data[0].rows[i].customData && !(this.pickUpLocationsTable.data[0].rows[i].customData.storeId in storeIds))
                this.pickUpLocationsTable.deleteRow(this.pickUpLocationsTable.data[0].rows[i])
    }

    var _this = this

    this.order = order

    var self = Ti.UI.createWindow({
        title: L('submitOrder'),
        backgroundColor: '#000',
        layout: 'vertical'
    })

    var scrollView = Ti.UI.createScrollView({
        contentWidth: 'auto',
        contentHeight: 'auto',
        top: 0,
        scrollType: 'vertical',
        showVerticalScrollIndicator: true,
        showHorizontalScrollIndicator: false,
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        layout: 'vertical'
    })

    self.add(scrollView)

    scrollView.add(Ti.UI.createLabel({
        text: String.format(L('submitOrderHeader'), order.pictureIds.length),
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
        touchEnabled: false
    }))

    var searchBar = Ti.UI.createSearchBar({
        showCancel: false,
        width: Ti.UI.FILL,
        height: 40,
        top: 6
    })

    this.pickUpLocationsTable = Ti.UI.createTableView({
        top: 4,
        height: Ti.UI.FILL,
        scrollable: false
    })

    scrollView.add(searchBar)
    scrollView.add(this.pickUpLocationsTable)

    // Create username/password form
    var horizontalView
    horizontalView = Ti.UI.createView({
        layout: 'horizontal',
        width: Ti.UI.SIZE
    })
    horizontalView.add(Ti.UI.createLabel({
        text: L('username'),
        width: 100,
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT
    }))
    horizontalView.add(Ti.UI.createTextField({
        width: 150
    }))

    var horizontalView2 = Ti.UI.createView({
        layout: 'horizontal',
        width: Ti.UI.SIZE
    })
    horizontalView2.add(Ti.UI.createLabel({
        text: L('password'),
        width: 100,
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT
    }))
    horizontalView2.add(Ti.UI.createTextField({
        width: 150,
        passwordMask: true
    }))

    var verticalView = Ti.UI.createView({
        layout: 'vertical'
    })
    verticalView.add(horizontalView)
    verticalView.add(horizontalView2)
    scrollView.add(verticalView)

    searchBar.addEventListener('change', function() { _this.updateSearchBar() })
    searchBar.addEventListener('return', function() { _this.updateSearchBar() })

    // TEST
    setTimeout(function() { _this.updateSearchBar() }, 200)

    return self
}

module.exports = SubmitOrderView