(function () {
	UI.registerHelper('venue', function _helperVenue(venueId) {
		if (!venueId) {
			venueId = UserSession.get("venueId");
		}
		return venueId ? Venues.find({_id: venueId}) : null;
	});
});
