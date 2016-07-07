/**
Injection script - Inject SSO Data into fields & submit form
**/

function fillInSSO(creds) {
	var Ecom_User_ID = document.getElementsByName("Ecom_User_ID")[0];
	var Ecom_Password = document.getElementsByName("Ecom_Password")[0];
	var oForm  = document.getElementsByName("IDPLogin")[0];
	Ecom_User_ID.value = creds["username"];
	Ecom_Password.value = creds["password"];
	oForm.submit();
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if(message["type"] == "isSSOLoginRequired") {
        fillInSSO(message["creds"]);
    }
});

