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
        setTimeout(function() {
            var i = 0
            /*for(var name in {"Horst" : 0, "Köhler" : 0})
                new MobiPrint.model.Location({
                    name: name,
                    address: "Im Hain 1"
                }).save()*/
            _this.setData({
                locations: [
                    {name: "Store 1", address: "New York"},
                    {name: "Store 2", address: "München"}
                ]
            })
            _this.sync()
            _this.load()

            //alert(_this.getData().length)
        }, 2000)

        console.log("MobiPrint.store.Locations.retrieve()~")
    }
})
