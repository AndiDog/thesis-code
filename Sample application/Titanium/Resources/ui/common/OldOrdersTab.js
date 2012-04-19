var moment = require('lib/moment')

function OldOrdersTab() {
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

    var table = new Titanium.UI.createTableView({
        headerTitle: String.format(L('oldOrdersInTotal'), testData.length),
        data: testData,
        scrollable: true
    })

    self.add(table)

    // Get actual list of old orders from web service
    var client = Ti.Network.createHTTPClient({
        onload: function(e) {
            var list = JSON.parse(this.responseText)
            var orders = list['orders']
            var tableData = []

            table.setHeaderTitle(String.format(L('oldOrdersInTotal'), orders.length))

            // Clear table entries
            table.setData([])

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
                table.appendRow(row)
            }
        },
        onerror: function(e) {
            Ti.API.error(e.error);
            alert('Error retrieving list of old orders: ' + e.error)
        },
        timeout: 5000
    })
    client.open('GET', Ti.App.globals.webServiceBaseUri + 'orders/')
    client.send()

    return self
}

module.exports = OldOrdersTab