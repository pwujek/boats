Template.crew.events = {
	
	'click input.delete': function _TemplateNewCrewEventsInputDelete() {
		Competitors.remove(this._id);
	},
	
	'click': function _TemplateNewCrewEventsClick() {
		UserSession.set("selected_competitor",this._id);
	}
};
