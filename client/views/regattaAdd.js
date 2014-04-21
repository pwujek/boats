Template.regattaAdd.events({
	'submit form': function(event, template) {
		event.preventDefault();
		var name = template.find('#name').value;
		var startDate = new Date(template.find('#startDate').value);
		var endDate = new Date(template.find('#endDate').value);
		var livePrice = template.find('#livePrice').value;
		var venueList = template.find('#venueList');
		var venueId = venueList.options[venueList.selectedIndex].value;
		var newRegatta = {
			name: name, 
			venueId: venueId, 
			livePrice: livePrice, 
			startDate: startDate, 
			endDate: endDate
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

