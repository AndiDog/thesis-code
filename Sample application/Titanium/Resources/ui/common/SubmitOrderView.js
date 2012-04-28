var moment = require('/lib/moment')

function SubmitOrderView(order)
{
    if(!(this instanceof SubmitOrderView))
        return new SubmitOrderView(order)

    this.getSelectedStoreId = function()
    {
        var previouslyChecked = null

        var rows = _this.pickUpLocationsTable.data.length > 0 ? _this.pickUpLocationsTable.data[0].rows : []
        for(var i = 0; i < rows.length; ++i)
            if(rows[i].hasCheck)
            {
                previouslyChecked = rows[i].customData.storeId
                break
            }

        return previouslyChecked
    }

    this.setLocation = function()
    {
        Ti.Geolocation.purpose = 'Find nearest stores'
        Ti.Geolocation.setAccuracy(Ti.Geolocation.ACCURACY_KILOMETER)

        var _this = this

        Ti.Geolocation.getCurrentPosition(function(e) {
            if(!e.success)
            {
                alert(String.format(L('couldNotFindLocation'), e.error.message))
                return
            }

            _this.searchBar.setValue(String.format('%.5f;%.5f', e.coords.latitude, e.coords.longitude))
        })
    }

    this.setStores = function(foundStores)
    {
        var storeIds = {}
        var previouslyChecked = -1

        var rows = _this.pickUpLocationsTable.data.length > 0 ? _this.pickUpLocationsTable.data[0].rows : []
        for(var i = 0; i < rows.length; ++i)
            if(rows[i].hasCheck)
            {
                previouslyChecked = rows[i].customData.storeId
                break
            }

        // Always have one store checked
        if(rows.length == 0 && foundStores.length > 0)
            previouslyChecked = foundStores[0].id

        this.pickUpLocationsTable.setData([])

        for(var i = 0; i < foundStores.length && i < 5; ++i)
        {
            var store = foundStores[i]
            storeIds[store.id] = true

            var row = Ti.UI.createTableViewRow({
                className: "store",
                hasCheck: previouslyChecked == store.id,
                layout: "vertical",
                customData: {storeId: store.id}
            })

            row.addEventListener('click', function(i) { return function() {
                var rows = _this.pickUpLocationsTable.data ? _this.pickUpLocationsTable.data[0].rows : []

                for(var j = 0; j < rows.length; ++j)
                    rows[j].hasCheck = (i == j)
            }}(i))

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
    }

    this.updateSearchBar = function(delay)
    {
        var search = this.searchBar.value

        if(search == this.lastRequest[0])
            return

        // We don't want to send a request for every character typed, that's what the "delay" parameter is for
        if((delay && moment().diff(this.lastRequest[1]) < 2500) || this.hasPendingRequest)
        {
            var _this = this

            setTimeout(function() { _this.updateSearchBar(true) }, 500)

            return
        }

        var latLngMatch = /^\s*(-?\d+\.\d+)\s*;\s*(-?\d+\.\d+)\s*$/.exec(search)
        var parameters

        if(latLngMatch)
            parameters = "lat=" + latLngMatch[1] + "&lng=" + latLngMatch[2]
        else
            parameters = "loc=" + encodeURIComponent(search)

        Ti.App.Properties.setString('storesSearch', search)

        var _this = this

        var client = Ti.Network.createHTTPClient({
            onload: function(e) {
                _this.lastRequest = [search, moment()]
                _this.hasPendingRequest = false
                _this.doTimeoutConnection = false

                var list = JSON.parse(this.responseText)
                var stores = list['stores']

                Ti.App.Properties.setList('stores', stores)

                _this.setStores(stores)
            },
            onerror: function(e) {
                _this.hasPendingRequest = false
                _this.doTimeoutConnection = false

                Ti.API.error(e.error)
                // TODO: replace by notification?!
                alert('Error retrieving list of nearest stores' + e.error)

                var cachedStores = Ti.App.Properties.getList('stores', null)
                if(cachedStores != null)
                    _this.setStores(cachedStores)
            },
            timeout: 5000
        })

        client.open('GET', Ti.App.globals.webServiceBaseUri + 'stores/by-location/?' + parameters)

        this.hasPendingRequest = true
        this.doTimeoutConnection = true

        // Timeout property does not apply to sending the request (e.g. TCP retransmissions will let the client wait a long time), so do it ourselves so that other search requests can be sent
        setTimeout(function() {
            if(_this.doTimeoutConnection)
                _this.hasPendingRequest = false
        }, 8500)

        client.send()
    }

    var _this = this

    this.order = order
    this.lastRequest = [null, moment().subtract('days', 1)]
    this.hasPendingRequest = false

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

    this.searchBar = Ti.UI.createSearchBar({
        showCancel: false,
        width: Ti.UI.FILL,
        height: 40,
        top: 6,
        hintText: L('searchStoresHint')
    })

    this.pickUpLocationsTable = Ti.UI.createTableView({
        top: 4,
        height: Ti.UI.FILL,
        scrollable: false
    })

    scrollView.add(this.searchBar)
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
    this.usernameTextField = Ti.UI.createTextField({
        width: 150
    })
    horizontalView.add(this.usernameTextField)

    var horizontalView2 = Ti.UI.createView({
        layout: 'horizontal',
        width: Ti.UI.SIZE
    })
    horizontalView2.add(Ti.UI.createLabel({
        text: L('password'),
        width: 100,
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT
    }))
    this.passwordTextField = Ti.UI.createTextField({
        width: 150,
        passwordMask: true
    })
    horizontalView2.add(this.passwordTextField)

    var verticalView = Ti.UI.createView({
        layout: 'vertical'
    })
    verticalView.add(horizontalView)
    verticalView.add(horizontalView2)
    scrollView.add(verticalView)

    var submitButton = Ti.UI.createButton({
        title : L('submit'),
        width: Ti.UI.FILL
    })
    scrollView.add(submitButton)

    submitButton.addEventListener('click', function() {
        var storeId = _this.getSelectedStoreId()
        if(storeId == null)
        {
            alert(L('mustSelectStore'))
            return
        }

        var username = _this.usernameTextField.value
        var password = _this.passwordTextField.value

        if(!username.length || !password.length)
        {
            alert(L('mustSelectUsernameAndPassword'))
            return
        }

        var client = Ti.Network.createHTTPClient({
            onload: function(e) {
                self.close()

                Ti.App.fireEvent('switch-to-orders-list-and-update')
            },
            onerror: function(e) {
                Ti.API.error(e.error);

                alert('Error submitting order: ' + e.error)
            },
            timeout: 5000
        })
        client.open('POST', Ti.App.globals.webServiceBaseUri + 'order/' + _this.order.id + '/submit/')
        client.send({username: username, password: password, storeId: storeId})
    })

    this.searchBar.setValue(Ti.App.Properties.getString('storesSearch', ''))
    this.searchBar.addEventListener('change', function() { _this.updateSearchBar(true) })
    this.searchBar.addEventListener('return', function() { _this.updateSearchBar() })

    if(Ti.Geolocation.locationServicesEnabled)
        setTimeout(function() { _this.setLocation() }, 1)
    else
        setTimeout(function() { _this.updateSearchBar() }, 1)

    return self
}

module.exports = SubmitOrderView