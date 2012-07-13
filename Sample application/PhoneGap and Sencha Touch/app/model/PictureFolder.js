Ext.define("MobiPrint.model.PictureFolder", {
    statics: {
        makeStringHash: function(s) {
            var hash = 0

            // Shamelessly copied from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
            for(var i = 0; i < s.length; ++i)
            {
                character = s.charCodeAt(i);
                hash = ((hash<<5)-hash) + character;
                hash = hash & hash // convert to 32-bit integer
            }

            return hash
        }
    },

    extend: "Ext.data.Model",
    config: {
        fields: [
            {name: "id", type: "id"},
            {name: "path", type: "string"},
            {name: "numPictures", type: "int"},
            {name: "name", type: "string"},
            {name: "lastUpdate", type: "date"}
        ],
        proxy: {
            type: "localstorage",
            id: "picture-folders"
        },
    },

    save: function(options, scope) {
        this.set("id", MobiPrint.model.PictureFolder.makeStringHash(this.get("path")))

        this.callParent([options, scope])
    }
})
