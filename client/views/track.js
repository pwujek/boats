Template.track.events({
	'click .trackThisPhoneButton': function _TemplateTrackClickTrackButton(event,template) {
		var trackingName = template.find('#name').value;
		if (!trackingName) {
			bootbox.alert('name is required');
			return;
		}
		UserSession.set('trackingName',trackingName);
		trackerMap = null;

		// Cordova background mode
		if (window.plugin && window.plugin.backgroundMode) {
			window.plugin.backgroundMode.enable();
		}

		Router.go('/tracking');
	},

	'click.recordSensors': function _TemplateTrackChangeRecordSensorsCheckbox(event, template) {
		if (template.find('#recordSensors').checked) {
			UserSession.set('recordingSensors',true);
		} else {
			UserSession.delete('recordingSensors');
		}
	}
});

Template.track.helpers({
	isRecordingSensors: function _isRecordingSensorsHelper(event, template) {
		return UserSession.get('recordingSensors');
	},
	gpsInterval: function _trackGpsIntervalHelper(event, template) {
		return 3;
	},
	sensorFrequency: function _trackSensorFrequencyHelper(event, template) {
		return 30;
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
