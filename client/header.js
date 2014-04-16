UI.registerHelper('regattaName', function _regattaNameHelper() {
	return regatta ? regatta.name : null;
});

UI.registerHelper('hasDeviceOrientation', function _hasDeviceOrientationHelper() {
	return window.DeviceOrientationEvent ? true : false;
});

UI.registerHelper('hasDeviceMotion', function _hasDeviceMotionHelper() {
	return window.DeviceMotionEvent ? true : false;
});
