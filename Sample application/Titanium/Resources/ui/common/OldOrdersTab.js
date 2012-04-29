var moment = require('lib/moment')
var OrderDetailView = require('/ui/common/OrderDetailView')

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
        var foundCurrentOrder = false
        var orders = []
        for(var i = 0; i < ordersCached.length; ++i)
            if(ordersCached[i].submissionDate != null)
                orders.push(ordersCached[i])
            else
            {
                foundCurrentOrder = true
                Ti.API.info('firing update-current-order')
                Ti.App.fireEvent('update-current-order', {order: ordersCached[i]})
            }

        if(!foundCurrentOrder)
        {
            var dummyCurrentOrder = {
                id: -1, // will not trigger any order-update-* events
                pictureIds: [],
                storeId: null,
                submissionDate: null
            }

            Ti.App.fireEvent('update-current-order', {order: dummyCurrentOrder})
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
                hasDetail: true,
                customData: {order: orders[i]}
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
    }

    var self = Ti.UI.createWindow({
        title: L('oldOrders'),
        backgroundColor: '#000'
    });

    this.table = new Titanium.UI.createTableView({
        headerTitle: '...',
        scrollable: true
    })

    this.table.addEventListener('click', function(e) {
        if(!e.row || !e.row.customData)
            return

        new OrderDetailView(e.row.customData.order, false).open({modal: true})
    })

    self.add(this.table)

    this.ordersInUi = null
    this.updateOrdersList(false, true, true)

    // Update orders list every 10 minutes
    var _this = this
    setInterval(function() {
        _this.updateOrdersList(true, false)
    }, 60000)

    // And also try it now
    _this.updateOrdersList(true)

    Ti.App.addEventListener('force-order-list-update', function() {
        _this.updateOrdersList(true, true)
    })
    Ti.App.addEventListener('force-update-current-order', function() {
        _this.updateOrdersList(false, false, true)
    })

    return self
}

module.exports = OldOrdersTab