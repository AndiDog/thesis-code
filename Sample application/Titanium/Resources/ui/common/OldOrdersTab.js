var moment = require('lib/moment')

function OldOrdersTab()
{
    if(!(this instanceof OldOrdersTab))
        return new OldOrdersTab()

    this.updateOrdersList = function(forceReload, forceUiRendering, forceUpdateCurrentOrderEvent)
    {
        var cachedEntry = Ti.App.Properties.getList('orders', null)

        // Check correct property format
        if(cachedEntry != null && cachedEntry.length != 2)
        {
            Ti.App.Properties.setList('orders', null)
            cachedEntry = null
        }

        // No need to reload or update UI if we still have a cached entry and reloading is not enforced
        if(cachedEntry != null && !forceReload && !forceUiRendering && !forceUpdateCurrentOrderEvent)
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

                for(var i = 0; i < orders.length; ++i)
                    Ti.App.fireEvent('update-order-' + orders[i].id, {order: orders[i]})

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
        var ordersCached = Ti.App.Properties.getList('orders', [[], null])[0]
        var tableData = []

        // Always send update-current-order event even if nothing changed
        var orders = []
        for(var i = 0; i < ordersCached.length; ++i)
            if(ordersCached[i].submissionDate != null)
            {
                Ti.API.info('old'+i)
                orders.push(ordersCached[i])
            }
            else
            {
                Ti.API.info('new'+i)
                Ti.App.fireEvent('update-current-order', {order: ordersCached[i]})
            }

        // Do not update/repaint list if nothing changed
        if(!forceUiRendering && JSON.stringify(ordersCached) == this.ordersInUi)
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

        this.ordersInUi = JSON.stringify(ordersCached)

        // TODO: update current order tab
    }

    var self = Ti.UI.createWindow({
        title: L('oldOrders'),
        backgroundColor: '#000'
    });

    this.table = new Titanium.UI.createTableView({
        headerTitle: '...',
        scrollable: true
    })

    self.add(this.table)

    this.ordersInUi = null
    this.updateOrdersList(false, true)

    // Update orders list every 10 minutes
    var _this = this
    setInterval(function() {
        _this.updateOrdersList(true, false)
    }, 60000)

    Ti.App.addEventListener('force-order-list-update', function() {
        _this.updateOrdersList(true, true)
    })

    return self
}

module.exports = OldOrdersTab