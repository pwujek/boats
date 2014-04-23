Template.rowingEvents.rowingEventsByRegattaId = function _TemplateRowingEventsRowingEventsByRegattaId() {
	if (regatta) {
		var regattaId = UserSession.get('regattaId');
		var events = RowingEvents.find({regattaId: regatta._id}).fetch();
		
		// fix the problem where 1 sorts after 10
		return _.sortBy(events,function (event) {
			if (isNaN(event.number)) return event.number;
			
			return event.number < 10 ? "0" + event.number : event.number;
		});
	}
}
