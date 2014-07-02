UI.registerHelper('regattaName', function _regattaNameHelper() {
	return regatta ? regatta.name : null;
});

UI.registerHelper('hasDeviceOrientation', function _hasDeviceOrientationHelper() {
	return window.DeviceOrientationEvent ? true : false;
});

UI.registerHelper('hasDeviceMotion', function _hasDeviceMotionHelper() {
	return window.DeviceMotionEvent ? true : false;
});

Template.header.connectionStatus = function () {
	var connectionStatus = Meteor.status().status;
	var retryCount = Meteor.status().retryCount;

	switch(connectionStatus){
		case "connected":
		return { label: "label-success",
				connectionStatus: connectionStatus};

		case "waiting":
		return { label: "label-warning",
				connectionStatus: connectionStatus,
				retryCount: retryCount};

		case "connecting":
		return { label: "label-info",
				connectionStatus: connectionStatus};

		case "failed":
		return { label: "label-danger",
				connectionStatus: connectionStatus};

		case "offline":
		return { label: "label-default",
				connectionStatus: connectionStatus};
	}
	return null;
};
