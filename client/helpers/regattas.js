UI.registerHelper('regattas', function _helperRegattas() {
	return Regattas.find({}, {sort: {date: 1}});
});
