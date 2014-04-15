Template.teams.teams = function _TemplateTeamsTeams() {
	var result = Teams.find({regattaId: regatta._id}, {sort: {name: 1}}).fetch();
	return result;
}
