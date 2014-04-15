UI.registerHelper('getEventName',function _helperGetEventName(rowingEventId) {
 var rowingEvent = RowingEvents.findOne({_id: rowingEventId});
	return rowingEvent ? rowingEvent.name : null;
});
