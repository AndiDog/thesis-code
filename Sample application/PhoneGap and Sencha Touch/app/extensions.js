navigator.toast = window.toastExtension

// For browser debugging
if(!navigator.toast)
    navigator.toast = {
        showLongToast: function(s) { alert(s) }
    }