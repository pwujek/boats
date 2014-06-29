Template.regattaAdd.events({
	'submit form': function(event, template) {
		event.preventDefault();
		var name = template.find('#name').value;
				if (!name) {
			bootbox.alert('name must be entered');
			return;
		}

		var startDate = Date.parseDate(template.find('#startDate').value,'d/m/Y');
		if (!startDate) {
			bootbox.alert('Start Date must be entered');
			return;
		}
		
		var endDate = Date.parseDate(template.find('#endDate').value,'d/m/Y');
		if (!endDate) {
			bootbox.alert('End Date must be entered');
			return;
		}
		
		var sponsor = template.find('#sponsor').value;
		if (!sponsor) {
			bootbox.alert("Sponsor's Name must be entered");
			return;
		}
		
		var sponsorURL = template.find('#sponsorURL').value;
		if (!sponsorURL) {
			bootbox.alert("Sponsor's Web Site URL must be entered");
			return;
		}

		var livePrice = template.find('#livePrice').value;
		var venueList = template.find('#venueList');
		var venueId = venueList.options[venueList.selectedIndex].value;
		if (!venueId) {
			bootbox.alert('Venue must be chosen');
			return;
		}
		
		var newRegatta = {
			name: name, 
			venueId: venueId, 
			livePrice: livePrice, 
			startDate: startDate, 
			endDate: endDate,
			sponsor: sponsor,
			sponsorURL: sponsorURL
		};
		var regattaId = Regattas.insert(newRegatta);
		UserSession.set('eventDate',startDate);

		if (regattaId) {
			newRegatta._id = regattaId;
			setRegatta(newRegatta);
			var raceCourse = {
				_id: regattaId,
				raceCourseStatus: 'CLOSED',
				officials: [],
				markers: [], // markers where timers are positioned
				races: [],
				lanes: []
			};
			RaceCourses.insert(raceCourse);

			Router.go('/regattaUpdate/'+regattaId);
		}
	}
});

Template.regattaAdd.rendered=function() {
	//https://atmospherejs.com/package/bootstrap3-datepicker
	$('#startDate').datepicker({todayBtn: true});
	$('#endDate').datepicker({todayBtn: true});
	$('#eventDate').datepicker({todayBtn: true});
}

Template.regattaAdd.venues = function() {
	return Venues.find({},{sort: {name: 1}}).fetch();
}