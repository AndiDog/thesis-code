var atfsys = require('uk.me.thepotters.atf.sys')
var moment = require('/lib/moment')

function PictureScanner()
{
    if(!(this instanceof PictureScanner))
        return new PictureScanner()

    this.scanSingleDirectory = function(path, results, currentDepth, countOnly)
    {
        if(currentDepth > 3)
        {
            Ti.API.info('Stopping picture scan at directory depth ' + currentDepth)
            return
        }

        // Do not test Unix-style hidden directories (e.g. file:///sdcard/DCIM/.thumbnails)
        if(/[\/\\]\.[^\/\\]+[\/\\]?$/.test(path))
            return

        var list = Ti.Filesystem.getFile(path).getDirectoryListing()

        // If it's not a directory
        if(list == null)
            return

        atfsys.OptimiseMemory()

        // Below, some statements were removed (marked "MEM") because they can cause memory problems in Titanium
        for(var i = 0; i < list.length; ++i)
        {
            if(i % 100 == 99)
                atfsys.OptimiseMemory()

            var subPath = path + Ti.Filesystem.separator + list[i].toString()

            // Check extension .jpg and size (<= 2MB, or check for undefined/null on unsupported platforms)
            if(subPath.slice(-4).toLowerCase() == '.jpg')
            {
                // MEM if(Ti.Filesystem.getFile(subPath).size <= 2097152 || !Ti.Filesystem.getFile(subPath).size)
                if(true)
                {
                    if(typeof(results[path]) == 'undefined')
                        results[path] = countOnly ? 0 : []

                    if(countOnly)
                        results[path]++
                    else
                        results[path].push(subPath)
                }
            }
            else // MEM if(Ti.Filesystem.getFile(subPath).isDirectory()) // isDirectory() marked Android only
                this.scanSingleDirectory(subPath, results, currentDepth + 1, countOnly)
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

        var root = 'file:///sdcard/DCIM'
        var results = {} // path -> picture count

        this.scanSingleDirectory(root, results, 1, true)

        Ti.API.debug('Picture scan results:')
        Ti.API.debug('---')

        for(var key in results)
        {
            Ti.API.debug('> ' + key)
            Ti.API.debug('   ' + results[key] + ' pictures found')
        }

        Ti.API.debug('---')

        Ti.App.Properties.setList('pictureScan', [results, moment().format()])

        return results
    }
}

module.exports = new PictureScanner()