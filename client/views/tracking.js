
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

/*
 * Kalman processor to smooth GPS readings
 */
var kalmanLatLonProcessor = new KalmanLatLon(3);

/*
	a table of what each digit in a decimal degree signifies:

    - sign tells us whether we are north or south, east or west on the globe.
    - nonzero hundreds digit tells us we're using longitude, not latitude!
    - tens digit gives a position to about 1,000 kilometers. It gives us useful information about what continent or ocean we are on.
    - units digit (one decimal degree) gives a position up to 111 kilometers (60 nautical miles, about 69 miles). It can tell us roughly what large state or country we are in.
	
	decimal places   degrees          distance
		   0         1                111  km
		   1         0.1              11.1 km
		   2         0.01             1.11 km
		   3         0.001            111  m
		   4         0.0001           11.1 m
		   5         0.00001          1.11 m
		   6         0.000001         11.1 cm
		   7         0.0000001        1.11 cm
		   8         0.00000001       1.11 mm
		   9         0.000000001      111  μm
		   10        0.0000000001     11.1 μm
		   11        0.00000000001    1.11 μm
		   12        0.000000000001   111  nm
		   13        0.0000000000001  11.1 nm

 */
newPositionHandler = function _newPositionHandler(position) {
	userPosition = markers[markerId()] ? markers[markerId()].position : null;
	
	// if phone gives timestamp use it, otherwise create it
	var timestamp = (position.coords.timestamp) ? position.coords.timestamp : new Date();
	
	// result of Vicenty distance calculation
	var vicenty = {
		distance: null,        // metres
		initialBearing: null,  // degrees
		finalBearing: null     // degrees
	};
	
	// speed calculated
	var speed; // metres/sec
	
	// Kalman corrected position
	var kPos;
	
	// if after the 1st reading
	if (userPosition) {
		// if this reading is less than 3 seconds from previous one return without saving
		var interval = timestamp.getTime() - userPosition.timestamp.getTime();
		if (interval < 3000) return;

		// compare values at 11m accuracy
		var fromLat = position.coords.latitude.toFixed(4);
		var fromLon = position.coords.longitude.toFixed(4);
		var toLat   = userPosition.latitude.toFixed(4);
		var toLon   = userPosition.longitude.toFixed(4);
		
		// if new coordinate within 11m of previous coordinate return without saving
		// because a normal GPS is only accurate to about 9.3 metres
		// Will this create start-line errors?
		if (fromLat === toLat && fromLon === toLon) return;
		
		// obtain a corrected Lat/Lon from the Kalman processor
		kPos = kalmanLatLonProcessor.process(position.coords.latitude, position.coords.longitude, position.coords.accuracy, timestamp.getTime());
		
		vicenty = GeoJsonUtils.distVincenty(kPos.lat, kPos.lon, userPosition.latitude, userPosition.longitude);
		
		speed = parseFloat((vicenty.distance / (interval / 1000) ).toFixed(1));
		
		// too slow for racing
		//if (speed < 2.0) return;
		
		// too fast for racing (Olympic rowers are about 8.4 m/s)
		//if (speed > 10) return;
	} else {
		// first reading
		// initialize the kalman processor
		// in the future use starting gate Lat/Lon for boat's lane?
		kPos = kalmanLatLonProcessor.setState(position.coords.latitude, position.coords.longitude, position.coords.accuracy, timestamp);
	}

	var isTracking = UserSession.get('isTracking');
	if (!isTracking || !trackerMap) return;
	if (!regatta) {
		regatta = Regattas.findOne(UserSession.get('regattaId'));
	}

	var currentPosition = {
		regattaId: regatta._id,
		userId:    markerId(), 
		trackingName: UserSession.get('trackingName'),
		latitude:  kPos.lat, 
		longitude: kPos.lon, 
		accuracy:  kPos.accuracy, 
		timestamp: timestamp || 0,
		speed:     speed || 0.0,
		bearing:   vicenty.finalBearing,
		error:     position.coords.error || ""
	};

	try {
		console.log("inserting "+(currentPosition ? currentPosition.toJson() : "currentPosition"));
	} catch (e) {console.log(e);}
	Positions.insert(currentPosition);
	userPosition = currentPosition;
}

function positionErrorHandler() {
	console.log("error getting position");
	return;
}

Template.tracking.events({
	'click .stopTrackingButton': function _TemplateTrackEventsClickStopTrackingButton() {
		console.log('stopped tracking');
		watchid && navigator.geolocation.clearWatch(watchid);
		
		// Cordova background mode
		if (window.plugin && window.plugin.backgroundMode) {
			window.plugin.backgroundMode.disable();
		}

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
				var latlng = {lat: position.latitude, lng: position.longitude};
				markerEntry.line.push(latlng);
				markerEntry.polyline.addLatLng(latlng);
				markerEntry.marker.setLatLng(latlng);
				markerEntry.position = position;
				markerEntry.marker.bindPopup(
					position.trackingName 
					+ '<br>' 
					+ position.userId
					+ (position.speed ? '<br>speed: ' + position.speed.toFixed(1) + 'm/s' : '') 
					+ (position.bearing ? '<br>bearing: ' +  position.bearing.toFixed(1) + '°' : '')
				);
				markerEntry.positions.push(position);
			} else {
				console.log('new marker '+markerId() + " lat:" + position.latitude + " lon:" + position.longitude);
				
				var userMarker = L.marker( [ position.latitude, position.longitude ] );
				userMarker.bindPopup(position.trackingName + '<br>' + position.userId);
				userMarker.addTo(trackerMap);
				trackerMap.addLayer(userMarker);
				var positions = new Array();
				positions.push(position);
				
				var line = [
					{lat: position.latitude, lng: position.longitude}
				];
				var polyline = L.polyline(line);
				trackerMap.addLayer(polyline);

				var markerEntry = {
					positions: positions,
					marker: userMarker,
					line: line,
					polyline: polyline
				};
				markerEntry.marker.bindPopup(
					position.trackingName 
					+ '<br>' 
					+ position.userId
				);
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
				if (markers[userId].position._id == id) {
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
			{'enableHighAccuracy': true, 'timeout': 10000, 'maximumAge': 20000});
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
			var position = {
				coords: {
					latitude:  e.latlng.lat, 
					longitude: e.latlng.lng,
					accuracy:  1
				}
			};
			newPositionHandler(position);
		});
		trackerMap.addLayer(Thunderforest_Landscape);
		console.log("tracking trackerMap created");
	}
}

