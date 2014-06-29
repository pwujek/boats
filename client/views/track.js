Template.track.events({
	'click .trackThisPhoneButton': function _TemplateTrackClickTrackButton() {
		var trackingName = document.getElementById('name').value;
		if (!trackingName) {
			bootbox.alert('name is required');
			return;
		}
		UserSession.set('trackingName',trackingName);
		trackerMap = null;
		var recordSensors = document.getElementById('recordSensors').value;
		if (recordSensors) {
			UserSession.set('recordingSensors',true);
		} else {
			UserSession.remove('recordingSensors');
		}

		// Cordova background mode
		if (window.plugin && window.plugin.backgroundMode) {
			window.plugin.backgroundMode.enable();
		}

		Router.go('/tracking');
	},

	'change.recordSensors': function _TemplateTrackChangeRecordSensorsCheckbox() {
		var recordingSensors = document.getElementById('recordSensors').value;
		if (recordingSensors) {
			UserSession.set('recordingSensors',recordingSensors);
		} else {
			UserSession.remove('recordingSensors');
		}
	}
});

Template.track.rendered = function () {
	//if (!regattaId) Router.go("/");
}

Template.track.name = function _TemplateTrackName () {
	return UserSession.get('trackingName');
}

Template.track.recordingSensors = function _TemplateTrackRecordingSensors () {
	var recordingSensors = UserSession.get('recordingSensors');
	console.log('recordingSensors:'+recordingSensors);
	return (recordingSensors ? 'checked' : '');
}
