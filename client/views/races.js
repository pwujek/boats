Template.races.races = function _TemplateRacesRaces() {
	return Races.find({},[{ sort: { startsAt: 1 }}]);
}

Template.races.racesByRegattaId = function _TemplateRacesRacesByRegattaId() {
	var regattaId = UserSession.get('regattaId');
	return Races.find({regattaId: regatta._id}, [{sort: {startsAt: 1}}]);
}
