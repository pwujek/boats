Template.regattas.regattas = function _TemplateRegattasRegattas() {
	return Regattas.find({}, {sort: {date: 1}});
}

Template.regattas.events({
	'click .switchButton': function _TemplateRegattasEventsClickSwitchButton(){
		setRegatta(this);
	},

	'click .updateButton': function _TemplateRegattasEventsClickUpdateButton(){
		setRegatta(this);
		Router.go("/regattaUpdate/"+this._id);
	},

	'click .deleteButton': function _TemplateRegattasEventsClickDeleteButton(){
		var name = this.name;
		var response = confirm("Do you want to delete Regatta: '"+name + "'?");
		if (response == true) {
			var regattaId = this._id;
			var positions = Positions.find({regattaId: regattaId}).fetch();
			positions.forEach(function(v){Positions.remove(v._id);}); 
			var races = Races.find({regattaId: regattaId}).fetch();
			races.forEach(function(v){Races.remove(v._id);}); 
			var raceCourses = RaceCourses.find({_id: regattaId}).fetch();
			raceCourses.forEach(function(v){RaceCourses.remove(v._id);}); 
			var rowingEvents = RowingEvents.find({regattaId: regattaId}).fetch();
			rowingEvents.forEach(function(v){RowingEvents.remove(v._id);}); 
			var timeRecords = TimeRecords.find({regattaId: regattaId}).fetch();
			timeRecords.forEach(function(v){TimeRecords.remove(v._id);}); 
			Regattas.remove(regattaId);
			alert("'" + name + "'' removed");
		}
	},

	'click .plusButton': function _TemplateRegattasEventsClickPlusButton(){
		Router.go("/regattaAdd");
	}
});
