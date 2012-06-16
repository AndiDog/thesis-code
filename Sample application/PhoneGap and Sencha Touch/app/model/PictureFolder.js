Ext.define("MobiPrint.model.PictureFolder", {
    extend: "Ext.data.Model",
    config: {
        // id == path shall be used, see below
        fields: ["path", "numPictures", "name"],
        proxy: {
            type: "localstorage",
            id: "picture-folders"
        },
    },

    save: function(options, scope) {
        this.set("id", this.get("path"))

        this.callParent([options, scope])
    }
})
