Template.track.events({
	'click .trackThisPhoneButton': function _TemplateTrackEventsClickTrackButton() {
		var trackingName = document.getElementById('name').value;
		if (!trackingName) {
			alert('name is required');
			return;
		}
		UserSession.set('trackingName',trackingName);
		trackerMap = null;
		Router.go('/tracking');
	}
});

Template.track.rendered = function () {
	if (!regattaId) Router.go("/");
}

Template.track.name = function _TemplateTrackName () {
	return UserSession.get('trackingName');
}

