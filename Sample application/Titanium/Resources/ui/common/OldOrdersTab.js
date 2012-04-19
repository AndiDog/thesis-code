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

            alert('Success: have ' + list['orders'].length + ' order(s)')
        },
        onerror: function(e) {
            Ti.API.debug(e.error);
            alert('Error retrieving list of old orders');
        },
        timeout: 5000
    })
    client.open('GET', Ti.App.globals.webServiceBaseUri + 'orders/')
    client.send()

    return self
}

module.exports = OldOrdersTab