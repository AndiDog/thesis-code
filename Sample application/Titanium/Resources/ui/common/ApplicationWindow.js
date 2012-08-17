function ApplicationWindow(title) {
    var self = Ti.UI.createWindow({
        title: title,
        backgroundColor: Ti.Platform.osname == 'android' ? '#000' : '#fff'
    });

    return self;
};

module.exports = ApplicationWindow;
