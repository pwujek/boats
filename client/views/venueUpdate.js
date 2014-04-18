splitLanes = function (value, fieldName) {
	if (!value) return;
	var tokens = value.split(',');
	var result = [];
	for (var i=0 ; i<tokens.length ; i++) {
		var n = validLane(tokens[i],fieldName);
		if (n)
			result[i] = n;
		else 
			return;
	}
	return result;
}

alertError = new function(message) {
	Alerts.add(message,'error');
}

validCoord = function (value, fieldName) {
	if (!value) {
		alertError(fieldName + ' is required');
		return false;
	}
	if (isNaN(value)) {
		alertError(fieldName + ': ' + value + ' is not a valid GPS coordinate');
		return false;
	}
	return true;
}

validLane = function (value,fieldName) {
	var n = parseInt(value);
	if (n === 'NaN') {
		alertError(fieldName + ': ' + value + ' is not an integer');
		return;
	}
	if (n < 1 || n > 12 ) {
		alertError(fieldName + ': ' + value + ' is not in the range 1-12');
		return;
	}
	return n;
}

Template.venueUpdate.events({
	'submit form': function(event,template) {
		event.preventDefault();
		var name = template.find('#name').value;
		var address = template.find('#address').value;
		var timezone = template.find('#timezone').value;
		var lanes = template.find('#lanes').value;
		var markersString = template.find('#markers').value;
		var progressionLanesString = template.find('#progressionLanes').value;
		var latitude = template.find('#latitude').value;
		var longitude = template.find('#longitude').value;
		if (!name) {
			alertError('name must be entered');
			return;
		}
		if (!name) {
			alertError('name must be entered');
			return;
		}
		if (!address) {
			alertError('name must be entered');
			return;
		}
		if (!timezone) {
			alertError('timezone must be entered');
			return;
		}
		if (!markersString) {
			alertError('markers must be entered');
			return;
		}
		var markers = markersString.split(',');
		lanes = validLane(lanes,'number of lanes');
		if (!lanes) {
			alertError('lanes invalid');
			return;
		}
		var progressionLanes = splitLanes(progressionLanesString,'progression lanes');
		if (!progressionLanes) {
			alertError('progression lanes invalid');
			return;
		}
		if (!validCoord(latitude,'latitude')) return;
		if (!validCoord(longitude,'longitude')) return;
		var changes = {
			name: name, 
			address: address, 
			timezone: timezone, 
			lanes: lanes, 
			markers: markers, 
			progressionLanes: progressionLanes,
			latitude: latitude,
			longitude: longitude
		};
		Venues.update({_id: this._id},{$set: changes});
		alertError('Venue '+this._id+' updated');
		Router.go('/venueUpdate/'+this._id);
	},

	'click .delete': function(e) {
		e.preventDefault();
		var venueId = this._id;
		if (confirm("Delete venue '"+venueId+"'?")) {
			Venues.remove(venueId);
			Alerts.add("Venue "+name+" removed",'info',{ fadeIn: 200, fadeOut: 200, autoHide: 3000 });

			Router.go('/venues');
		}
	}
});
