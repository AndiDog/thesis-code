var moment = require('/lib/moment')

function PictureScanner()
{
    if(!(this instanceof PictureScanner))
        return new PictureScanner()

    this.scanSingleDirectory = function(path, results)
    {
        // Do not test Unix-style hidden directories (e.g. file:///sdcard/DCIM/.thumbnails)
        if(/[\/\\]\.[^\/\\]+[\/\\]?$/.test(path))
            return

        var list = Ti.Filesystem.getFile(path).getDirectoryListing()

        // If it's not a directory
        if(list == null)
            return

        for(var i = 0; i < list.length; ++i)
        {
            var subPath = path + Ti.Filesystem.separator + list[i].toString()

            // Check extension .jpg and size (<= 2MB, or check for undefined/null on unsupported platforms)
            if(subPath.slice(-4).toLowerCase() == '.jpg' && (Ti.Filesystem.getFile(subPath).size <= 2097152 || !Ti.Filesystem.getFile(subPath).size))
            {
                if(typeof(results[path]) == 'undefined')
                    results[path] = []

                results[path].push(subPath)
            }
            else
                this.scanSingleDirectory(subPath, results)
        }
    }

    this.scan = function()
    {
        var cachedEntry = Ti.App.Properties.getList('pictureScan', null)

        // Check correct property format and outdated information (cache for 5 minutes)
        if(cachedEntry != null && (cachedEntry.length != 2 || moment().diff(moment(cachedEntry[1])) > 5*60000))
        {
            Ti.App.Properties.setList('pictureScan', null)
            cachedEntry = null
        }

        if(cachedEntry)
        {
            Ti.API.info('Cache hit for scanned pictures')
            return cachedEntry[0]
        }

        var root = 'file:///sdcard'
        var results = {} // path -> list of filenames

        this.scanSingleDirectory(root, results)

        Ti.API.debug('Picture scan results:')
        Ti.API.debug('---')

        for(var key in results)
        {
            Ti.API.debug('> '+key)

            for(var i = 0; i < results[key].length; ++i)
                Ti.API.debug('   '+results[key][i])
        }

        Ti.API.debug('---')

        Ti.App.Properties.setList('pictureScan', [results, moment().format()])

        return results
    }
}

module.exports = new PictureScanner()