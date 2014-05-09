Template.rowingEvent.races = function _TemplateRowingEventRaces(rowingEventId) {
	var result = Races.find({rowingEventId: rowingEventId}, { sort: {startsAt: 1 } }).fetch();
	return result;
}
