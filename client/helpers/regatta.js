UI.registerHelper('regatta', function _helperRegatta() {
	return regatta;
});

setRegatta = function _setRegatta(newRegatta) {
	console.log("setting regatta "+newRegatta.name);
	regatta = newRegatta;
	regattaId = newRegatta._id;
	UserSession.set("regatta",newRegatta);
	UserSession.set('regattaId',newRegatta._id);
}
