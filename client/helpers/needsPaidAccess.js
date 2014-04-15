UI.registerHelper('needsPaidAccess', function _helperNeedsPaidAccess() {
	if (regatta && regatta.livePrice > 0) {
		console.log('paid access required');
		return true;
	} else {
		//console.log('paid access not required');
		return false;
	}
});
