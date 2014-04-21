Template.venueAdd.events({
	'submit form': function(event,template) {
		event.preventDefault();
		var id = template.find('#id').value;
		var name = template.find('#name').value;
		var address = template.find('#address').value;
		var timezone = template.find('#timezone').value;
		var lanes = template.find('#lanes').value;
		var markersString = template.find('#markers').value;
		var progressionLanesString = template.find('#progressionLanes').value;
		var latitude = template.find('#latitude').value;
		var longitude = template.find('#longitude').value;
		if (!id) {
			alert('ID must be entered');
			return;
		}
		if (!name) {
			alert('name must be entered');
			return;
		}
		if (!address) {
			alert('address must be entered');
			return;
		}
		if (!timezone) {
			alert('timezone must be entered');
			return;
		}
		lanes = validLane(lanes,'number of lanes');
		if (!lanes) {
			alert('lanes invalid');
			return;
		}
		if (!markersString) {
			alert('markers invalid');
			return;
		}
		var markers = markersString.split(',');
		var progressionLanes = splitLanes(progressionLanesString,'progression lanes');
		if (!progressionLanes) {
			alert('progression lanes invalid');
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
			markers: markers, 
			progressionLanes: progressionLanes,
			latitude: latitude,
			longitude: longitude
		};
		var venueId = Venues.insert(newVenue);
		Router.go('/venueUpdate/'+venueId);
	}
});
