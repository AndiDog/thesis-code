function ApplicationWindow(title) {
    var self = Ti.UI.createWindow({
        title: title,
        backgroundColor: '#000'
    });

    return self;
};

module.exports = ApplicationWindow;
