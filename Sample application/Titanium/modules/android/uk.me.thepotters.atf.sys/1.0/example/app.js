// This is a test harness for your module
// You should do something interesting in this harness 
// to test out the module and to provide instructions 
// to users on how to use it by example.


// open a single window
var window = Ti.UI.createWindow({
	backgroundColor:'white'
});
var label = Ti.UI.createLabel();
window.add(label);
window.open();

// TODO: write your module tests here
var atfsys = require('uk.me.thepotters.atf.sys');
Ti.API.info("module is => " + atfsys);

atfsys.OptimiseMemory();
alert("Optimised");
setTimeout(function() {atfsys.OptimiseMemory(); atfsys.KillMyProcess();}, 5000);
