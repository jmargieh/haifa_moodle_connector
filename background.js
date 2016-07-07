/**
This is the main extension's code, also known as the background page script in Chrome extensions.
This file communicates with the content scripts that have been injected into the active webpage
if it is a Moodle page. It uses HTML5's local storage API to load the stored username and password.
Since the login credentials to the Moodle are static, and sometimes transferred in plain text,
it seemed like an overkill to store them in an encrypted storage location.
**/

// Global message listener
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	console.log("Got message: type is " + message["type"]);
	if(message["type"] == "init" && getShouldRun() === true) {
		checkLoginRequired();
	}
	if(message["type"] == "shouldLogin" && message["value"] === true) {
		// If the user just logged out, it's best to wait a little before logging back in
		setTimeout(loginToMoodle, 300);
	}
	if(sender.url.indexOf("https://huids.haifa.ac.il/nidp/saml2/sso?id") != -1 ) {
	// If the user just logged out, it's best to wait a little before logging back in
	setTimeout(loginToSSO, 300);
	}
});

function sendToActiveTab(message) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		for(var i=0; i<tabs.length; i++){
		chrome.tabs.sendMessage(tabs[i].id, message)
		}
	});
}

function reloadActiveTab() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.reload(tabs[0].id);
	});
}

function removeActiveTab() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.remove(tabs[0].id);
	});
}

function getShouldRun() {
	return localStorage.enabled !== undefined 
		&& localStorage.enabled != "undefined"
		&& localStorage.enabled !== false
		&& localStorage.enabled != "false"
		&& localStorage.username !== undefined 
		&& localStorage.password !== undefined;
}

function checkLoginRequired() {
	sendToActiveTab({"type": "isLoginRequired"});
}

function getLoginCreds() {
	// This function assumes that username and password are defined in the local storage
	return {"username": localStorage.username, "password": localStorage.password};
}

function redirectToMoodle(){
	chrome.tabs.update({url:"http://moodle.haifa.ac.il/login/index.php"});
}

function loginToSSO() {
	var creds = getLoginCreds();
	sendToActiveTab({"type": "showOverlay"});
	sendToActiveTab({"type": "isSSOLoginRequired", "creds": getLoginCreds() });
	setTimeout(redirectToMoodle,600);
}

function loginToMoodle() {
	removeActiveTab();
	chrome.tabs.create({
        'url': 'http://moodle.haifa.ac.il/login/index.php'
    }, function(tab) {
	sendToActiveTab({"type": "isSSOLoginRequired"});
    	});
}
