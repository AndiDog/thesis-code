language = {}

function applyLanguage(locale)
{
    strings = language[locale]
}

function LazyI18nString(key)
{
    this.key = key
}

LazyI18nString.prototype.toString = function()
{
    console.log("_("+this.key+") evaluation")
    if(!strings.hasOwnProperty(this.key))
        throw "No translation for key " + this.key

    return strings[this.key]
}

function _(key)
{
    console.log("_("+key+")")
    return new LazyI18nString(key)
}
