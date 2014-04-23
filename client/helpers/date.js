UI.registerHelper("prettifyDate", function(timestamp) {
	if (timestamp)
		return timestamp.toLocaleDateString();
	else
		return '';
});

UI.registerHelper("prettifyTimestamp", function(timestamp) {
	if (timestamp)
		return timestamp.toISOString().substr(11,22);
	else
		return '';
});

UI.registerHelper("prettifyTime", function(timestamp) {
	if (timestamp) {
		var time = timestamp.toLocaleTimeString().substr(0,5);
		if (time.charAt(4) === ':') time = time.substr(0,4);
		if (time.charAt(0) === '0') time = time.substr(1);
		return time;
	} else {
		return '';
	}
});
