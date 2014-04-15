Template.rowingEvents.rowingEventsByRegattaId = function _TemplateRowingEventsRowingEventsByRegattaId() {
	if (regatta) {
		var regattaId = UserSession.get('regattaId');
		return RowingEvents.find({regattaId: regatta._id}, [{sort: {name: 1}}]).fetch();
	}
}
