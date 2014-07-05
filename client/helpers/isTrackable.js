// isTrackable helper
// true when this device has functionality that allows tracking
// {{#if isTrackable}}
// <!-- trackable markup -->
// {{/if}}
UI.registerHelper('isTrackable',function _helperIsTrackable() {
	var trackable = navigator.geolocation && window.DeviceMotionEvent;
	return trackable;
});
