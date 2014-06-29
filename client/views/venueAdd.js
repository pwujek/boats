Template.venueAdd.events({
	'submit form': function(event,template) {
		event.preventDefault();
		var id = template.find('#id').value;
		var name = template.find('#name').value;
		var address = template.find('#address').value;
		var timezone = template.find('#timezone').value;
		var lanes = template.find('#lanes').value;
		var progressionLanesString = template.find('#progressionLanes').value;
		var latitude = template.find('#latitude').value;
		var longitude = template.find('#longitude').value;
		if (!id) {
			bootbox.alert('ID must be entered');
			return;
		}
		if (!name) {
			bootbox.alert('name must be entered');
			return;
		}
		if (!address) {
			bootbox.alert('address must be entered');
			return;
		}
		if (!timezone) {
			bootbox.alert('timezone must be entered');
			return;
		}
		lanes = validLane(lanes,'number of lanes');
		if (!lanes) {
			bootbox.alert('lanes invalid');
			return;
		}
		if (!markersString) {
			bootbox.alert('markers invalid');
			return;
		}
		var markers = markersString.split(',');
		var progressionLanes = splitLanes(progressionLanesString,'progression lanes');
		if (!progressionLanes) {
			bootbox.alert('progression lanes invalid');
			return;
		}
		if (!validCoord(latitude,'latitude')) return;
		if (!validCoord(longitude,'longitude')) return;

		var newVenue = {
			_id: id,
			name: name, 
			address: address, 
			timezone: timezone, 
			lanes: lanes, 
			progressionLanes: progressionLanes,
			latitude: latitude,
			longitude: longitude
		};
		var venueId = Venues.insert(newVenue);
		Router.go('/venueUpdate/'+venueId);
	}
});
