var moment = require('lib/moment')

function OldOrdersTab()
{
    if(!(this instanceof OldOrdersTab))
        return new OldOrdersTab()

    this.updateOrdersList = function(forceReload, forceUiRendering)
    {
        var cachedEntry = Ti.App.Properties.getList('orders', null)

        // Check correct property format
        if(cachedEntry.length != 2)
        {
            Ti.App.Properties.setList('orders', null)
            cachedEntry = null
        }

        // No need to reload or update UI if we still have a cached entry and reloading is not enforced
        if(cachedEntry != null && !forceReload && !forceUiRendering)
            return

        // If only UI should be rendered from cached data
        if(cachedEntry != null && !forceReload)
        {
            this.updateOrdersListUi(forceUiRendering)
            return
        }

        var _this = this
        // Get actual list of old orders from web service
        var client = Ti.Network.createHTTPClient({
            onload: function(e) {
                var list = JSON.parse(this.responseText)
                var orders = list['orders']

                Ti.App.Properties.setList('orders', [orders, moment()])

                _this.updateOrdersListUi(forceUiRendering)
            },
            onerror: function(e) {
                Ti.API.error(e.error);
                // TODO: replace by notification?!
                alert('Error retrieving list of old orders: ' + e.error)
            },
            timeout: 5000
        })
        client.open('GET', Ti.App.globals.webServiceBaseUri + 'orders/')
        client.send()
    }

    this.updateOrdersListUi = function(forceUiRendering)
    {
        var orders = Ti.App.Properties.getList('orders', [[], null])[0]
        var tableData = []

        // Do not update/repaint list if nothing changed
        if(!forceUiRendering && JSON.stringify(orders) == Ti.App.Properties.getString('ordersInUi', null))
            return

        this.table.setHeaderTitle(String.format(L('oldOrdersInTotal'), orders.length))

        // Clear table entries
        this.table.setData([])

        for(var i = 0; i < orders.length; ++i)
        {
            var row = Titanium.UI.createTableViewRow({
                title: moment(orders[i].submissionDate).format("dddd, MMMM Do YYYY"),
                hasDetail: true
            })

            var labelLeft = Ti.UI.createLabel({
                left: 10,
                text: moment(orders[i].submissionDate).format("dddd, MMMM Do YYYY")
            })
            var labelRight = Ti.UI.createLabel({
                right: 10,
                text: String.format(L('numPictures'), orders[i].pictureIds.length)
            })

            row.add(labelLeft)
            row.add(labelRight)
            this.table.appendRow(row)
        }

        Ti.App.Properties.setString('ordersInUi', JSON.stringify(orders))
    }

    var self = Ti.UI.createWindow({
        title: L('oldOrders'),
        backgroundColor: '#000'
    });

    var testData = [
        {title: 'Row 1'},
        {title: 'Row 2'},
        {title: 'Row 3'},
        {title: 'Row 4'},
        {title: 'Row 5'},
        {title: 'Row 6'},
        {title: 'Row 7'},
        {title: 'Row 8'},
        {title: 'Row 9'},
        {title: 'Row 10'},
        {title: 'Row 11'},
        {title: 'Row 12'}
    ]

    for(var i = 0; i < 12; ++i)
        testData[i] = {title: 'Row ' + (i+1),
                       hasDetail: true}

    this.table = new Titanium.UI.createTableView({
        headerTitle: String.format(L('oldOrdersInTotal'), testData.length),
        data: testData,
        scrollable: true
    })

    self.add(this.table)

    this.updateOrdersList(false, true)

    // Update orders list every 10 minutes
    var _this = this
    setInterval(function() {
        _this.updateOrdersList(true, false)
    }, 600000)

    return self
}

module.exports = OldOrdersTab