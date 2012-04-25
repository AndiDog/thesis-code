function PictureUpload()
{
    if(!(this instanceof PictureUpload))
        return new PictureUpload()

    this.getUploadingPictures = function()
    {
        ret = []

        for(var filename in this.uploadingFilenames)
            if(this.uploadingFilenames[filename])
                ret.push(filename)

        return ret
    }

    this.isUploading = function(filename)
    {
        return !!this.uploadingFilenames[filename]
    }

    this.upload = function(filename)
    {
        if(this.uploadingFilenames[filename])
            return

        var blob = Ti.Filesystem.getFile(filename).read()
        var _this = this

        var client = Ti.Network.createHTTPClient({
            onload: function(e) {
                Ti.API.info('Picture ' + filename + ' successfully uploaded')

                _this.uploadingFilenames[filename] = false
            },
            onerror: function(e) {
                _this.uploadingFilenames[filename] = false

                alert('Failed to upload picture: ' + e.error + ' (mind that the maximum allowed picture size is 2MB)')
            },
            timeout: 5000
        })

        client.open('PUT', Ti.App.globals.webServiceBaseUri + 'pictures/')
        client.send({picture: blob})

        this.uploadingFilenames[filename] = true

        Ti.App.fireEvent('force-update-current-order')
    }

    // Pictures that are currently being uploaded
    this.uploadingFilenames = {}

    // TODO: testing only
    //this.upload('file:///sdcard/Download/W5GJ3.jpg')
}

module.exports = new PictureUpload()
