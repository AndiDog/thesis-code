console.log("i18n")

language = {}

window.applyLanguage = function(locale)
{
    strings = language[locale]

    // As soon as the language is set, the lazy function is not necessary
    // anymore and we replace it by the non-lazy variant which does not require
    // manual .toString() calls as the lazy function does in some cases.
    _ = translationFromKey
}

function LazyI18nString(key)
{
    this.key = key
}

LazyI18nString.prototype.toString = function()
{
    if(!strings.hasOwnProperty(this.key))
        throw "No translation for key " + this.key

    return strings[this.key]
}

// Lazy translation function, works even if language is not set yet (necessary
// for view definitions as "config: {}" that are executed before the
// application's launch function)
window._ = function(key)
{
    return new LazyI18nString(key)
}

// Non-lazy version of _ (see above)
function translationFromKey(key)
{
    if(!strings.hasOwnProperty(key))
        throw "No translation for key " + key

    return strings[key]
}

console.log("i18n~")
