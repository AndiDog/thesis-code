console.log("extensions")

navigator.toast = window.toastExtension

// For browser debugging
if(!navigator.toast)
    navigator.toast = {
        showLongToast: function(s) { alert(s) }
    }
if(!navigator.notification)
    navigator.notification = {
        alert: function(s) { alert(s) }
    }
if(!navigator.geolocation)
    navigator.geolocation = {
        getCurrentPosition: function(success, fail) {
            setTimeout(fail, 0)
        }
    }
if(!navigator.splashscreen)
{
    phoneGapReady = true
    navigator.splashscreen = {
        hide: function() { }
    }
}
else
    phoneGapReady = false

browserDebugging = true
document.addEventListener("deviceready", function() {
    console.log("phoneGapReady()")

    phoneGapReady = true
    browserDebugging = false

    if(!window.requestFileSystem)
        throw "File API not available using PhoneGap"

    console.log("phoneGapReady()~")
}, false)

console.log("extensions~")
