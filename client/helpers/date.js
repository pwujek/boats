UI.registerHelper("prettifyDate", function(timestamp) {
	if (timestamp)
		return timestamp.toLocaleDateString();
	else
		return '';
});

UI.registerHelper("prettifyTimestamp", function(timestamp) {
	if (timestamp)
		return timestamp.toLocaleDateString().substr(0,9);
	else
		return '';
});

UI.registerHelper("prettifyTime", function(timestamp) {
	if (timestamp)
		return timestamp.toLocaleDateString().substr(0,5);
	else
		return '';
});
