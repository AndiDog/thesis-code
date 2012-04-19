function ApplicationTabGroup(Window) {
	//create module instance
	var self = Ti.UI.createTabGroup();
	
	//create app tabs
	var win1 = new Window(L('oldOrders')),
		win2 = new Window(L('addPictures')),
		win3 = new Window(L('currentOrder'));
	
	var tab1 = Ti.UI.createTab({
		title: L('oldOrders'),
		icon: '/images/KS_nav_ui.png',
		window: win1
	});
	win1.containingTab = tab1;
	
	var tab2 = Ti.UI.createTab({
		title: L('addPictures'),
		icon: '/images/KS_nav_ui.png',
		window: win2
	});
	win2.containingTab = tab2;
	
	var tab3 = Ti.UI.createTab({
		title: L('currentOrder'),
		icon: '/images/KS_nav_ui.png',
		window: win3
	});
	win3.containingTab = tab3;
	
	self.addTab(tab1);
	self.addTab(tab2);
	self.addTab(tab3);
	
	return self;
};

module.exports = ApplicationTabGroup;
