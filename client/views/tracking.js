/*
 *Can I use HTML5 Geolocation for mobile tracking? 
 * Yes, with caveats. Typically HTML5 tracking applications are built 
 * inside a native wrapper framework such as PhoneGap or Titanium. 
 * 
 * There are several immediate problems with stand-alone, browser-only 
 * HTML5 tracking applications:
 *	1.	No built-in functionality to keep the screen from going to sleep. 
 *	2.	When the screen goes to sleep the HTML5 Geolocation functionality also goes to sleep. 
 *		Native-based tracking applications can work around these limitations 
 *		and listen passively in the background when they are minimized. 
 *      Cannot use it when the application is minimized. If your requirements 
 *		call for the ability to passively receive locations while in a minimized 
 *		state then, as mentioned earlier, you will have to go native.
 *	3.	Little control over the GPS settings to help management battery consumption.
 */

// globals
positionQuery = null;
watchid = null;
trackerMap = null;
userPosition = null;
trackerMap = null;
markers = {};

/**
rotation value is poorly supported, and the interval value lies.
events are usually generated as fast the CPU can do them
sometimes as often as 400 times per second 
- can use up a lot of battery if not controlled
- usually setup a timer to control sampling rate as required
*/
deviceMotionHandler = function _deviceMotionHandler(eventData) {
	// SI units (m/s^2) units are used to indicate acceleration
	UserSession.set('acceleration',eventData);       
}

markerId = function _markerId() {
	return Meteor.user().emails[0].address;
}

newPositionHandler = function _newPositionHandler(position) {

	userPosition = markers[markerId()] ? markers[markerId()].position : null;

	if (userPosition
		&&	position.coords.latitude  === userPosition.latitude 
		&&  position.coords.longitude === userPosition.longitude) {
		return;
	}

	var isTracking = UserSession.get('isTracking');
	if (!isTracking || !trackerMap) return;
	if (!regatta) {
		regatta = Regattas.findOne(UserSession.get('regattaId'));
	}
	/****
	var acceleration, x, y, z;
	if (navigator.acceleration) {
		acceleration = UserSession.get('acceleration');
	}

	acceleration = UserSession.get("acceleration");

	if (acceleration) {
		x = acceleration.accelerationIncludingGravity.x;
		y = acceleration.accelerationIncludingGravity.y;
		z = acceleration.accelerationIncludingGravity.z;
	}
****/
	var timestamp = (position.coords.timestamp) ? position.coords.timestamp : new Date();

	// check for time too close to last time
	if (userPosition && userPosition.timestamp == timestamp)
		return;

	var currentPosition = {
		regattaId: regatta._id,
		userId:    markerId(), 
		trackingName: UserSession.get('trackingName'),
		latitude:  position.coords.latitude, 
		longitude: position.coords.longitude, 
		accuracy:  position.coords.accuracy, 
		timestamp: timestamp, 
		error:     position.coords.error
	};

	console.log("inserting "+JSON.stringify(currentPosition));
	Positions.insert(currentPosition);
	
	if (userPosition) {
		currentPosition.distance = Math.abs(geoJsonUtil.distVincenty(userPosition.latitude, userPosition.longitude, currentPosition.latitude, currentPosition.longitude));
		currentPosition.distanceTotal += currentPosition.distance;

		currentPosition.time = (currentPosition.timestamp.getMilliseconds() - userPosition.timestamp.getMilliseconds());
		currentPosition.timeTotal += currentPosition.time;

		currentPosition.speed = Math.abs((distance.distance / time).toFixed(1));
	}
	userPosition = currentPosition;
}

function positionErrorHandler() {
	Alerts.add("error getting position",'error',{ fadeIn: 1000, fadeOut: 1000, autoHide: 3000 });
	return;
}

Template.tracking.events({
	'click .stopTrackingButton': function _TemplateTrackEventsClickStopTrackingButton() {
		console.log('stopped tracking');
		watchid && navigator.geolocation.clearWatch(watchid);
		UserSession.set('isTracking',false);
		Router.go('/track');
	}
});

Template.tracking.isTracking = function _trackHelperIsTracking() {
	var isTracking = UserSession.get('isTracking');
	return isTracking === true;
};

Template.tracking.positions = function _TemplateTrackPositions() {
	return Positions.find({}, {sort: {userId: 1, timestamp: 1}});
}

Template.tracking.rendered = function () {
	if (!regattaId) Router.go("/");

	console.log("Template.tracking.rendered");

	//if (!this.rendered) {
	positionQuery = Positions.find({regattaId: regattaId});

	/* observer changes the markers on the map
	 * whenever a position is changed
	 */
	positionChangeHandler = positionQuery.observeChanges({
		added: function _positionChangeHandlerAdded (id, position) {
			var markerEntry = markers[position.userId];
			if (markerEntry) {
				var prevPosition = markerEntry.positions[markerEntry.positions.length - 1];
				var distance = geoJsonUtil.distVincenty(prevPosition.latitude, prevPosition.longitude, position.latitude, position.longitude);
				var time = (position.timestamp.getMilliseconds() - prevPosition.timestamp.getMilliseconds());
				var speed = Math.abs((distance.distance / time).toFixed(1));
				console.log('moved ' +markerId() + 	' lat: ' + position.latitude + ' lon: ' + position.longitude + ' speed: ' + speed + 'm/s');
				var speedStr = ((speed < 2) || (speed > 10)) ? '<br><strong><span style="color:red">' + speed + '</span>m/s</strong>' : '<br><strong>' + speed + 'm/s</strong>';
				var latlng = {lat: position.latitude, lng: position.longitude};
				markerEntry.line.push(latlng);
				markerEntry.polyline.addLatLng(latlng);
				markerEntry.marker.setLatLng(latlng);
				markerEntry.marker.bindPopup(
					position.trackingName 
					+ '<br>' 
					+ position.userId
					+ speedStr
				);
				markerEntry.position.push(position);
			} else {
				console.log('new marker '+markerId() + " lat:"+position.latitude+" lon:"+position.longitude);
				
				var userMarker = L.marker( [ position.latitude, position.longitude ] );
				userMarker.bindPopup(position.trackingName + '<br>' + position.userId);
				userMarker.addTo(trackerMap);
				trackerMap.addLayer(userMarker);
				
				var line = [
					{lat: position.latitude, lng: position.longitude}
				];
				var polyline = L.polyline(line);
				trackerMap.addLayer(polyline);
				var positions = new Array();
				positions.push(position);

				var markerEntry = {
					positions: positions,
					marker: userMarker,
					line: line,
					polyline: polyline
				};
				markers[position.userId] = markerEntry;
			}
		},

		changed: function _positionChangeHandlerChanged (id, position) {
			console.log(markerId() + " moved to lat:" + position.latitude + " lon:" + position.longitude);
			var userMarker = markers[position.userId].marker;
			userMarker.setLatLng(position.latitude, position.longitude);
			markers[position.userId].position = position;
		},

		removed: function _positionChangeHandlerRemoved (id) {
			for (userId in markers) {
				if (markers[userId] && markers[userId].position._id == id) {
					delete markers[userId];
					console.log("Lost one. We're now down to " + Object.keys(markers).length + " positions.");
				}
			}
		}
	});

	Meteor.subscribe("PositionsForThisUserId", Meteor.userId);
	var trackingName = UserSession.get('trackingName');
	console.info(Meteor.userId + " trackThisPhone " + trackingName);

	markers = {};

	if (window.DeviceMotionEvent) {
		console.log("Device Motion supported");
		UserSession.set('hasMotionEvents', true);
		var current_motion = null;
		var sample_frequency = 100; // sample every 100usec

		// set the event handler to detect acceleration
		window.addEventListener("devicemotion", function(event) {
			UserSession.set("current_motion", event);
		},false);

		// set acceleration detection timer 
		window.setInterval(function() {
			var current_motion = UserSession.get("current_motion");
			if (current_motion !== null) {
				deviceMotionHandler(current_motion);
			}
		},sample_frequency);

		// set the event handler to detect geolocation
		watchid = navigator.geolocation.watchPosition(
			newPositionHandler,
			positionErrorHandler,
			{'enableHighAccuracy': true, // forces mobile to use GPS
			 'timeout': 0, // timeout = 0 and maximumAge = Infinity it will force the application to grab any cached location, if one is available. Other settings may result in delays.
			 'maximumAge': Infinity}
		);
		UserSession.set('isTracking',true);
	}

	if (navigator.geolocation){
		navigator.geolocation.getCurrentPosition(newPositionHandler, positionErrorHandler, { enableHighAccuracy: true });
	} else {
		console.log("Geolocation is not supported by this browser.");
	}

	// mapping (could be done in startup?)
	if (!trackerMap) {
		if (!regatta) {
			regatta = Regattas.findOne(UserSession.get('regattaId'));
		}
		var venueId = regatta.venueId;
		var venue = Venues.findOne({_id: venueId});
		console.log("venue: "+venue.latitude+","+venue.longitude);

		// leaflet.js setup
		L.Icon.Default.imagePath = 'packages/leaflet/images';
		var Thunderforest_Landscape = L.tileLayer('http://{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png', {
			minZoom: 1,
			maxZoom: 100,
			attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
		});

		trackerMap = L.map('map').setView([venue.latitude, venue.longitude], 14);
		trackerMap.on('click',function(e) {
			var currentPosition = {
				regattaId: regatta._id,
				userId:    markerId(), 
				trackingName: UserSession.get('trackingName'),
				latitude:  e.latlng.lat, 
				longitude: e.latlng.lng, 
				accuracy:  10, 
				timestamp: new Date()
			};
			Positions.insert(currentPosition);
		});
		/****
			var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
			var osmAttrib='Map data © OpenStreetMap contributors';
			var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});
			map.setView(new L.LatLng(venue.lat, venue.lon),14);
			****/
		trackerMap.addLayer(Thunderforest_Landscape);
	/*****	
			if (Roles.userIsInRole(Meteor.user(), ['test'])) {
				// Initialize the FeatureGroup to store editable layers
				var drawnItems = new L.FeatureGroup();

				// add drawing controls for map mocking
				trackerMap.addLayer(drawnItems);

				// Initialize the draw control and pass it the FeatureGroup of editable layers
				var drawControl = new L.Control.Draw({
					edit: {
						featureGroup: drawnItems
					}
				});
				trackerMap.addControl(drawControl);
			}
	****/
			console.log("tracking trackerMap created");
		}
	//	this.rendered = true;
	//}
}

