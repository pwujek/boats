UI.registerHelper("debug", function _helperDebug(optionalValue) { 
	console.log("debug this:" + this);

	if (optionalValue) {
		console.log("debug optionValue:" + optionalValue); 
	} 
});
