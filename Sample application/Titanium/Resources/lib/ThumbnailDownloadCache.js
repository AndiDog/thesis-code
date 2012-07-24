var moment = require('lib/moment')

function ThumbnailDownloadCache()
{
    if(!(this instanceof ThumbnailDownloadCache))
        return new ThumbnailDownloadCache()

    // Downloads thumbnail with the given ID in the background
    this.downloadThumbnail = function(id, onSuccess)
    {
        if(this.currentlyDownloading[id])
        {
            Ti.API.debug('Not downloading thumbnail ' + id + ' because it is already being downloaded')
            return
        }

        var filename = Ti.Filesystem.applicationDataDirectory + id + '.jpg'
        if(Ti.Filesystem.getFile(filename).exists() && Ti.Filesystem.getFile(filename + '.cacheInfo').exists())
        {
            var expires = moment(JSON.parse(Ti.Filesystem.getFile(filename + '.cacheInfo').read().text))

            if(expires.diff(moment()) > 0)
            {
                Ti.API.debug('Cache hit for thumbnail ' + id)

                // We can still use the cached file
                if(onSuccess)
                    onSuccess()

                return
            }
            else
            {
                Ti.API.debug('Cached thumbnail ' + id + ' expired (' + expires.format() + '), deleting it')

                // File expired, try to delete it
                Ti.Filesystem.getFile(filename).deleteFile()
                Ti.Filesystem.getFile(filename + '.cacheInfo').deleteFile()
            }
        }
        else
            Ti.API.debug('Thumbnail ' + id + ' not cached')

        Ti.API.debug('Trying to download thumbnail ' + id)

        var _this = this
        var client = Ti.Network.createHTTPClient({
            onload: function(e) {
                _this.currentlyDownloading[id] = false

                var f = Ti.Filesystem.getFile(filename)
                f.write(this.responseData)

                Ti.API.info('Downloaded and saved thumbnail ' + id)

                // Simple caching based on Expires header, no other cache control headers (if no header given, cache for 10 minutes)
                var expires = this.getResponseHeader('Expires')
                var cacheInfoFile = Ti.Filesystem.getFile(filename + '.cacheInfo')

                if(expires)
                {
                    var expiresFormatted = moment.utc(expires.slice(4, -4), 'D MMM YYYY HH:mm:ss').format()
                    Ti.API.debug('Thumbnail ' + id + ' will expire at ' + expiresFormatted)
                    cacheInfoFile.write(JSON.stringify(expiresFormatted))
                }
                else
                    cacheInfoFile.write(JSON.stringify(moment().add('minutes', 10).format()))

                if(onSuccess)
                    onSuccess()
            },
            onerror: function(e) {
                _this.currentlyDownloading[id] = false

                Ti.API.error(e.error);

                Ti.UI.createNotification({
                    duration: Ti.UI.NOTIFICATION_DURATION_SHORT,
                    message: 'Error retrieving thumbnail ' + id + ': ' + e.error
                }).show()
            },
            timeout: 5000,
            cache: true // iOS only (http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.Network.HTTPClient.cache-property.html)
        })

        this.currentlyDownloading[id] = true

        try
        {
            // Take Titanium points size of display as size hint
            var thumbnailSize = Math.max(5, Math.min(500, Math.max(Ti.Platform.displayCaps.getPlatformWidth(), Ti.Platform.displayCaps.getPlatformHeight())))

            client.open('GET', Ti.App.globals.webServiceBaseUri + 'picture/' + id + '/thumbnail/?size=' + thumbnailSize)
            client.send()
        }
        catch(e)
        {
            this.currentlyDownloading[id] = false
            throw e
        }
    }

    this.getFilename = function(id)
    {
        return Ti.Filesystem.applicationDataDirectory + id + '.jpg'
    }

    this.currentlyDownloading = {}
}

module.exports = new ThumbnailDownloadCache()
