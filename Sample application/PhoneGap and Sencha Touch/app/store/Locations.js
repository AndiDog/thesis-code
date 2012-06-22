Ext.define("MobiPrint.store.Locations", {
    extend: "Ext.data.Store",
    requires: ["MobiPrint.model.Location"],
    config: {
        model: "MobiPrint.model.Location",
        autoLoad: true
    },

    retrieve: function(loc) {
        console.log("MobiPrint.store.Locations.retrieve(loc=" + loc + ")")

        this.each(function(record) { record.erase() })

        var _this = this
        var query

        if(/\d+\.\d+,\d+\.\d+/.test(loc))
            query = "lat=" + encodeURIComponent(loc.split(",")[0]) + "&lng=" + encodeURIComponent(loc.split(",")[1])
        else
            query = "loc=" + encodeURIComponent(loc)

        Ext.Ajax.request({
            url: WEB_SERVICE_BASE_URI + "stores/by-location/?" + query,
            success: function(response) {
                _this.setData({
                    locations: Ext.JSON.decode(response.responseText)["stores"]
                })
                _this.sync()
                _this.load()
            },
            failure: function() {
                navigator.toast.showLongToast("Failed to retrieve nearby stores")
            }
        })

        console.log("MobiPrint.store.Locations.retrieve()~")
    }
})
