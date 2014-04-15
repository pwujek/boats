Template.crewAdd.events = {
	'click input.add': function _TemplateNewCrewMemberEventsInputAdd() {
		var crewId = document.getElementById("crewId").value;
		var competitorId = document.getElementById("competitorId").value;
		var name = document.getElementById("name").value;
		var seat = document.getElementById("seat").value;
		Competitors.insert({crewId: crewId, name: name, seat: seat});
	}
};
