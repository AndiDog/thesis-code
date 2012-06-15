navigator.toast = window.toastExtension

// For browser debugging
if(!navigator.toast)
    navigator.toast = {
        showLongToast: function(s) { alert(s) }
if(!navigator.splashscreen)
{
    phoneGapReady = true
    navigator.splashscreen = {
        hide: function() { }
    }
}
else
{
    phoneGapReady = false

    document.addEventListener("deviceready", function() {
        phoneGapReady = true
    }, false)
}
