Template.venues.venues = function _TemplateVenuesVenues() {
	return Venues.find({}, {sort: {name: 1}});
}
