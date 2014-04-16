Template.venues.venues = function _TemplateVenuesVenues() {
	return Venues.find({}, {sort: {name: 1}});
}

Template.venues.events({
	'click .switchButton': function _TemplateRegattasEventsClickSwitchButton(){
		setRegatta(this);
	},

	'click .updateButton': function _TemplateRegattasEventsClickUpdateButton(){
		setRegatta(this);
		Router.go("/venueUpdate/"+this._id);
	},

	'click .deleteButton': function _TemplateRegattasEventsClickDeleteButton(){
		var name = this.name;
		var response = confirm("Do you want to delete Venue: '"+name + "'?");
		if (response == true) {
			var venueId = this._id;
			Venues.remove(venueId);
			alert("'" + name + "'' removed");
		}
	},

	'click .plusButton': function _TemplateVenuesEventsClickPlusButton(){
		Router.go("/venueAdd");
	}
});
