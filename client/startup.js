// client/startup.js
// subscriptions, Meteor.startup code
Meteor.startup(function(){
	var srcName = 'client/startup.js';
	//console.info('Meteor.startup',srcName);

	// initialize meteor-event-hooks for login/logout detection
	Hooks.init();
	/***
	try {
		Meteor.logoutOtherClients(function () {
			user = Session.get('dlgUserName');
			if (!name) {
				name = Meteor.user.name;
			}
			console.info(name+' logged in',srcName);
		});

	} catch (ex) {
		console.info('Meteor.logoutOtherClients failed',srcName);
		return;
	}
***/
	Accounts.ui.config({
		passwordSignupFields: 'EMAIL_ONLY'
	});
});

// Add String.trim() function if not available (IE <8)
if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/g, '');
	};
}

UI._allowJavascriptUrls();

// Set up globals
regatta = null;
regattaId = null;

Meteor.subscribe("venues");
Meteor.subscribe("regattas");
Meteor.subscribe("competitors");
Meteor.subscribe("races");
Meteor.subscribe("teams");
Meteor.subscribe("crews");
