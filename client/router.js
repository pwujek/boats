regatta = Session.get('regatta');

// use FastRender to get first page data in HTML of first load
AppController = FastRender.RouteController.extend({
	onBeforeAction:function _AppControllerBefore(){
		if(_.isNull(Meteor.user())){
			console.log("_AppControllerBefore - go home");
			Router.go(Router.path('home'));
		}
	}
});

Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading',
	notFoundTemplate: 'notfound',
	yieldTemplates: {
		'header': {to: 'header'},
		'footer': {to: 'footer'}
	}
});

Router.onBeforeAction('loading');

var filters = {
	/**
   * ensure user is logged in and 
   * email verified
   */
	authenticate: function _filtersAuthenticate() {
		var user;

		if (Meteor.loggingIn()) {
			console.log('filter: loading');
			this.render('loading');
			this.layout = 'layout_no_header';
			this.stop();
		} else {
			user = Meteor.user();

			if (!user) {
				console.log('filter: signin');
				this.render('login');
				this.layout = 'layout_no_header';
				this.stop();
				return
			}

			if (!emailVerified(user)) {
				console.log('filter: awaiting-verification');
				this.render('awaiting-verification');
				this.layout = 'layout';
				this.stop();
			} else {
				console.log('filter: done');
				this.layout = 'layout';
			}
		}
	},  // end authenticate

	/**
   * always require a regatta to begin, what if there are none?
   */
	regattaNotYetChosen: function _filtersRegattaNotChosen() {
		var regattaId = Session.get('regattaId');
		if (!regattaId) {
			console.log('no regatta chosen')
			this.render('regattas');
			this.layout = 'layout_no_header';
			this.stop();
			return
		}
	}
};  // end filters

// forces a login if the user is not currently logged in
forceLogin = function _forceLogin() {
	if (regatta) {
		if (!Meteor.user() && regatta.livePrice > 0) {
			console.log('router.js-forceLogin: not logged in - showing login');
			// render the login template but keep the url in the browser the same
			this.render('login');

			// stop the rest of the before hooks and the action function 
			this.stop();
			return;
		} 
	} else {
		console.log('router.js-forceLogin: no regatta - going home');
		// render the login template but keep the url in the browser the same
		this.render('home');

		// stop the rest of the before hooks and the action function 
		this.stop();
		return;
	}
}

// always checked for logged in before routing to another panel
Router.onBeforeAction(forceLogin,{except:['home',
										  'login',
										  'signup',
										  'forgotPassword',
										  'adminusers',
										  'deleteUserDialog',
										  'editUserDialog',
										  'infoUserDialog']});

Router.map(function _routerMap() {

	/**
  * The route's name is "home"
  * The route's template is also "home"
  * The default action will render the home template
  */
	this.route('home', {
		path: '/',
		template: 'home',
		fastRender: true
	});

	/**
  * The route's name is "login"
  * The route's template is also "login"
  * The default action will render the login template
  */
	this.route('login', {
		path: '/login',
		template: 'login',

		waitOn: function _routerMapLoginWaitOn() {
			return Meteor.subscribe('users');
		},

		fastRender: true

	});

	/**
  * The route's name is "raceCourses"
  * The route's template is also "raceCourses"
  * The default action will render the raceCourses template
  */
	this.route('raceCourses', {
		path: '/raceCourses/:regattaId',
		template: 'raceCourseForRegatta',

		waitOn: function _routerMapRaceCoursesWaitOn() {
			return Meteor.subscribe('raceCourseForRegatta',Session.get('regattaId'));
		},

		data: function _routerMapRaceCoursesData() {
			return RaceCourses.findOne({_id: this.params.regattaId});
		}
	});


	/**
  * The route's name is "races"
  * The route's template is also "races"
  * The default action will render the races template
  */
	this.route('races', {
		path: '/races' 
	});

	/**
  * The route's name is "profile"
  * The route's template is also "profile"
  * The default action will render the races template
  */
	this.route('profile', {
		path: '/profile',
		template: 'races',

		waitOn: function _routerMapProfileWaitOn() {
			return Meteor.subscribe('races');
		},

		fastRender: true,

		data: function _routerMapProfileData() {
			if (Meteor.user()) {
				regatta = UserSession.get('regatta');
			}
			return Races.find({regattaId: regatta._id });
		}

	});

	/**
  * The route's name is "race"
  * The route's template is also "race"
  * The default action will render the race template
  */
	this.route('race', {
		path: '/races/:_id',
		template: 'race',
		notFoundTemplate: 'raceNotFound',

		waitOn: function _routerMapRaceWaitOn() {
			return Meteor.subscribe('racesForRegatta');
		},

		data: function _routerMapRaceData() {
			return Races.findOne({_id: this.params._id});
		}
	});

	/**
  * The route's name is "teams"
  * The route's template is also "teams"
  * The de,

		onBeforeAction: [
			function _routerMapRaceBefore() {
				var race = this.getData();
			}
		]fault action will render the teams template
  */
	this.route('teams', {
		path: '/teams'
	});

	/**
  * The route's name is "teams"
  * The route's template is also "teams"
  * The default action will render the teams template
  */
	this.route('team', {
		path: '/teams/:_id',
		template: 'team',
		notFoundTemplate: 'teamNotFound',

		waitOn: function _raceMapTeamWaitOn() {
			return Meteor.subscribe('teams');
		},

		data: function _raceMapTeamData() {
			return Teams.findOne({_id: this.params._id});
		}
	});

	this.route('competitors', {
		path: '/competitors',
		template: 'competitors'
	});

	this.route('competitor', {
		path: '/competitors/:_id',
		template: 'competitor',
		notFoundTemplate: 'timeNotFound',

		waitOn: function _routerMapCompetitorsWaitOn() {
			return Meteor.subscribe('competitors');
		},

		data: function _routerMapCompetitorsData() {
			return Competitorss.findOne({_id: this.params._id});
		}
	});

	/**
  * the route's name is "crews"
  * the route's template is also "crews"
  * the default action will render the crews template
  */
	this.route('crews', {
		path: '/crews'
	});

	/**
  * The route's name is "teams"
  * The route's template is also "teams"
  * The default action will render the teams template
  */
	this.route('crew', {
		path: '/crews/:_id',
		template: 'crew',
		notFoundTemplate: 'crewNotFound',

		waitOn: function _routerMapCrewWaitOn() {
			return Meteor.subscribe('crews');
		},

		data: function _routerMapCrewData() {
			return Crews.findOne({_id: this.params._id});
		}
	});

	this.route('regattas', {
		path: '/regattas',
		template: 'regattas'
	});

	this.route('regatta', {
		path: '/regattas/:_id',
		template: 'regatta',
		notFoundTemplate: 'regattaNotFound',

		waitOn: function _routerMapRegattaWaitOn() {
			return Meteor.subscribe('regattas');
		},

		data: function _routerMapRegattaData() {
			return Regattas.findOne({_id: this.params._id});
		}
	});

	this.route('regattaAdd', {
		path: '/regattaAdd',
		template: 'regattaAdd'
	});

	this.route('regattaUpdate', {
		path: '/regattaUpdate/:_id',
		data: function _routerMapRegattaData() { return Regattas.findOne({_id: this.params._id}); }
	});

	this.route('venues', {
		path: '/venues',
		template: 'venues'
	});

	this.route('venue', {
		path: '/venues/:_id',
		template: 'venue',
		notFoundTemplate: 'venueNotFound',

		waitOn: function _routerMapVenueWaitOn() {
			return Meteor.subscribe('venues');
		},

		data: function _routerMapVenueData() {
			return Venues.findOne({_id: this.params._id});
		}
	});

	this.route('rowingEvents', {
		path: '/rowingEvents',
		template: 'rowingEvents'
	});

	this.route('track', {
		path: '/track',
		template: 'track'
	});

	this.route('rowingEvent', {
		path: '/rowingEvents/:_id',
		template: 'rowingEvent',
		notFoundTemplate: 'rowingEventNotFound',

		waitOn: function _routerMapRowingEventWaitOn() {
			return Meteor.subscribe('rowingEvents');
		},

		data: function _routerMapRowingEventData() {
			return RowingEvents.findOne({_id: this.params._id});
		}
	});

	this.route('timeRecords', {
		path: '/timeRecords',
		template: 'timeRecords'
	});

	this.route('timeRecord', {
		path: '/timeRecords/:_id',
		template: 'timeRecord',
		notFoundTemplate: 'timeNotFound',

		waitOn: function _routerMapTimeRecordWaitOn() {
			return Meteor.subscribe('timeRecords');
		},

		data: function _routerMapTimeRecordData() {
			return TimeRecords.findOne({_id: this.params._id});
		}
	});

	this.route('adminusers', {
		path: '/adminusers',
		template: 'update-users'
	});

	this.route('logout', {
		path: '/logout',
		template: 'login'
	});

	this.route('notfound', {
		path: '*'
	});
});

Meteor.subscribe("venues");
Meteor.subscribe("regattas");
Meteor.subscribe("competitors");
Meteor.subscribe("races");
Meteor.subscribe("teams");
Meteor.subscribe("crews");

Template.regattas.regattas = function _TemplateRegattasRegattas() {
	return Regattas.find({}, {sort: {date: 1}});
}

UI.registerHelper('regattas', function _helperRegattas() {
	return Regattas.find({}, {sort: {date: 1}});
});

UI.registerHelper('regatta', function _helperRegatta() {
	return regatta;
});

UI.registerHelper('needsPaidAccess', function _helperNeedsPaidAccess() {
	if (regatta && regatta.livePrice > 0) {
		console.log('paid access required');
		return true;
	} else {
		//console.log('paid access not required');
		return false;
	}
});

UI.registerHelper("debug", function _helperDebug(optionalValue) { 
	console.log("debug this:" + this);

	if (optionalValue) {
		console.log("debug optionValue:" + optionalValue); 
	} 
});

Template.races.races = function _TemplateRacesRaces() {
	return Races.find({},[{ sort: { startsAt: 1 }}]);
}

Template.race.crewsByRaceId = function _TemplateRaceCrewsByRaceId(raceId) {
	return Crews.find({raceId: raceId}, {sort: {place: 1, bow: 1}});
}

Template.raceCourseForRegatta.races = function _TemplateRaceCourseForRegattaRaces(races) {
	var sortedRaces = [];
	if (!races) {

		console.log('raceCoursesForRegatta no races found ');
		alert("no races are currently running");
		return "";
	} else {
		console.log('raceCoursesForRegatta');
		sortedRaces = races.sort();
	}	
	result = "";
	for (var i=0; i < sortedRaces.length ; i++) {
		raceNumber = races[i];
		console.log('generateRaces raceNumber:'+raceNumber);
		if (isNaN(raceNumber)) {
			btnColor = 9;
		} else {
			btnColor = raceNumber % 9;
		}
		race = Races.findOne({number: raceNumber});
		if (race !== undefined) {
			eventName = getEventName(race.rowingEventId);
			stageName = getStageName(race.stageType,race.stageNumber);
			result += '<span class="boat button btn btn-sm btn-'+btnColor+'">Race '+raceNumber+' '+eventName+'-'+stageName+'</span> ';
		}
	}
	return result;
}

Template.raceCourseForRegatta.lanes = function _TemplateRaceCourseForRegattaLanes(lanes, markers) {
	console.log('generateLines ');
	result = "";
	console.log('generateLines lanes.length:'+lanes.length);
	for (var lane=0; lane < lanes.length ; lane++) {
		console.log('generateLines lane:'+lanes[lane].number);
		result += '<tr><td>' + lanes[lane].number + '</td>';
		markerArray = [];
		for (var crewIndex=0 ; crewIndex < lanes[lane].crews.length ; crewIndex++) {
			crew = lanes[lane].crews[crewIndex];
			console.log('generateLines crew bow:'+crew.bow+" lastMarker:"+crew.lastMarker);

			if (crew.lastMarker)
				marker = _.indexOf(markers,crew.lastMarker)+1;
			else
				marker = 0;

			if (markerArray[marker] === undefined) {
				markerArray[marker] = new Array();
			}
			markerArray[marker].push(crew);
		}
		for (var marker=0; marker < markerArray.length ; marker++) {
			result += '<td>';
			markerCrews = markerArray[marker];
			for (var crew=0 ; crew < markerCrews.length ; crew++) {
				race = markerCrews[crew].race;

				if (isNaN(race)) {
					bowColor = 9;
				} else {
					bowColor = race % 9;
				}

				console.log('generateLines crew bow:'+crew.bow+" bowColor:"+bowColor);
				result += '<span class="boat button btn btn-sm btn-boat btn-'+bowColor+'" title="'+markerCrews[crew].name+'">'+markerCrews[crew].bow+'</span> ';
			}
			result += '</td>';
		}
		result += '</tr>\n';
	}
	return result;
}

getEventName = function _getEventName(rowingEventId) {
	rowingEvent = RowingEvents.findOne(rowingEventId);
	return rowingEvent.name;
}

UI.registerHelper('getEventName',function _helperGetEventName(rowingEventId) {
	return getEventName(rowingEventId);
});

getStageName = function _getStageName(stageType, stageNumber) {
	if (stageType) {
		stageType = stageType.toLowerCase();
		if (stageType == 'final') {
			return 'Final';
		}
		if (stageType == 'head') {
			return 'Head';
		}
		return stageType + (stageNumber === undefined ? '' : ' ' + stageNumber);
	} else {
		return "";
	}
}

UI.registerHelper('getStageName',function _helperGetStageName(stageType, stageNumber) {
	return getStageName(stageType,stageNumber); 
});

Template.races.racesByRegattaId = function _TemplateRacesRacesByRegattaId() {
	var regattaId = Session.get('regattaId');
	return Races.find({regattaId: regatta._id}, [{sort: {startsAt: 1}}]);
}

Template.rowingEvents.rowingEventsByRegattaId = function _TemplateRowingEventsRowingEventsByRegattaId() {
	if (regatta) {
		var regattaId = Session.get('regattaId');
		return RowingEvents.find({regattaId: regatta._id}, [{sort: {name: 1}}]).fetch();
	}
}

Template.rowingEvent.races = function _TemplateRowingEventRaces(rowingEventId) {
	var result = Races.find({rowingEventId: rowingEventId}, [{sort: {startsAt: 1}}]).fetch();
	return result;
}

Template.teams.teams = function _TemplateTeamsTeams() {
	var result = Teams.find({regattaId: regatta._id}, {sort: {name: 1}}).fetch();
	return result;
}

Template.venues.venues = function _TemplateVenuesVenues() {
	return Venues.find({}, {sort: {name: 1}});
}

Template.race.placeName = function _TemplateRacePlaceName(value) { 
	var placeNames = ["",
					  "1st","2nd","3rd","4th","5th","6th","7th","8th","9th",
					  "10th","11st","12nd","13rd","14th","15th","16th","17th","8th","19th",
					  "20th","21st","22nd","23rd","24th","25th","26th","27th","28th","29th",
					  "30th","31st","32nd","33rd","34th","35th","36th","37th","38th","39th"];

	return value ? placeNames[value] + " - ": "";
}

Template.race.whenExists = function _TemplateRaceWhenExists(name,value) { 
	return value ? name + ":" + value + " ": "";
}

Template.race.whenExistsPct = function _TemplateRaceWhenExistsPct(value) { 
	return value ? value + "% ": "";
}

Template.new_crew_member.events = {
	'click input.add': function _TemplateNewCrewMemberEventsInputAdd() {
		var crewId = document.getElementById("crewId").value;
		var competitorId = document.getElementById("competitorId").value;
		var name = document.getElementById("name").value;
		var seat = document.getElementById("seat").value;
		Competitors.insert({crewId: crewId, name: name, seat: seat});
	}
};

Template.crew.events = {
	'click input.delete': function _TemplateNewCrewEventsInputDelete() {
		Competitors.remove(this._id);
	},
	'click': function _TemplateNewCrewEventsClick() {
		Session.set("selected_competitor",this._id);
	}
};

Template.logout.events({
	'click input[type=button]': function _TemplateLogoutEventsClickButton(){
		Meteor.logout();
	}
});

Template.admin_nav.events({
	'click .users': function _TemplateAdminNavEventsClickUsers(){
		Router.go(Router.path("adminusers"));
	},
	'click .regattas': function _TemplateAdminNavEventsClickRegattas(){
		Router.go(Router.path("regattas"));
	}
});

Template.referee_nav.events({
	'click .timings': function _TemplateRefereeNavEventsClickTimings(){
		Router.go(Router.path("timeRecords"));
	}
});

Template.official_nav.events({
	'click .record-times': function _TemplateOfficialNavEventsClickRecordTimes(){
		Router.go(Router.path("timeRecords"));
	}
});

Template.update_regatta_nav.events({
	'click .update-regatta': function _TemplateUpdateRegattaNavEventsClickUpdateRegatta(){
		Router.go(Router.path("regattaUpdate"));
	}
});

Template.update_venue_nav.events({
	'click .venues': function _templateupdatevenuenaveventsclickvenues(){
		Router.go(Router.path("venues"));
	}
});

Template.update_team_nav.events({
	'click .teams': function _templateupdateteamnaveventsclickteams(){
		Router.go(Router.path("teams"));
	}
});

Template.update_crew_nav.events({
	'click .crews': function _TemplateUpdateCrewNavEventsClickCrews(){
		Router.go(Router.path("crews"));
	}
});

setRegatta = function _setRegatta(newRegatta) {
	regatta = newRegatta;
	Session.set("regatta",newRegatta);
	Session.set('regattaId',newRegatta._id);

	if (Meteor.user()) {
		UserSession.set("regatta",newRegatta);
	}
}

Template.regattas.events({
	'click .switchButton': function _TemplateRegattasEventsClickSwitchButton(){
		setRegatta(this);
	},
	'click .updateButton': function _TemplateRegattasEventsClickUpdateButton(){
		setRegatta(this);
		Router.go("/regattaUpdate/"+this._id);
	},	
	'click .deleteButton': function _TemplateRegattasEventsClickDeleteButton(){
		var name = this.name;
		var response = confirm("Do you want to delete Regatta: '"+name + "'?");
		if (response == true) {
			var regattaId = this._id;
			var positions = Positions.find({regattaId: regattaId}).fetch();
			positions.forEach(function(v){Positions.remove(v._id);}); 
			var races = Races.find({regattaId: regattaId}).fetch();
			races.forEach(function(v){Races.remove(v._id);}); 
			var raceCourses = RaceCourses.find({_id: regattaId}).fetch();
			raceCourses.forEach(function(v){RaceCourses.remove(v._id);}); 
			var rowingEvents = RowingEvents.find({regattaId: regattaId}).fetch();
			rowingEvents.forEach(function(v){RowingEvents.remove(v._id);}); 
			var timeRecords = TimeRecords.find({regattaId: regattaId}).fetch();
			timeRecords.forEach(function(v){TimeRecords.remove(v._id);}); 
			Regattas.remove(regattaId);
			alert("'" + name + "'' removed");
		}
	},

	'click .plusButton': function _TemplateRegattasEventsClickPlusButton(){
		Router.go("/regattaAdd");
	}
});

/**
rotation value is poorly supported, and the interval value lies.
events are usually generated as fast the CPU can do them
sometimes as often as 400 times per second 
- can use up a lot of battery if not controlled
- usually setup a timer to control sampling rate as required
*/
deviceMotionHandler = function _deviceMotionHandler(eventData) {
	// SI units (m/s^2) units are used to indicate acceleration
	Session.set('acceleration',eventData);       
}

userPosition = null;
trackerMap = null;

newPositionHandler = function _newPositionHandler(position) {
	var isTracking = Session.get('isTracking');
	if (!isTracking) return;

	var acceleration, x, y, z;
	if (navigator.acceleration) {
		acceleration = Session.get('acceleration');
	}

	acceleration = Session.get("acceleration");

	if (acceleration) {
		x = acceleration.accelerationIncludingGravity.x;
		y = acceleration.accelerationIncludingGravity.y;
		z = acceleration.accelerationIncludingGravity.z;
	}

	var timestamp = new Date();
	if (position.coords.timestamp) {
		timestamp = position.coords.timestamp;
	}
	
	// check for time too close to last time
	if (userPosition && userPosition.timestamp == timestamp)
		return;

	var currentPosition = new Position(
		regatta._id,
		Meteor.userId(), 
		position.coords.latitude, 
		position.coords.longitude, 
		position.coords.accuracy, 
		position.coords.altitude, 
		position.coords.altitudeAccurracy, 
		position.coords.heading, 
		position.coords.speed, 
		timestamp, 
		position.coords.error,
		x,
		y,
		z
	);

	if (userPosition) {
		if (currentPosition.latitude != userPosition.latitude || currentPosition.longitude != userPosition.longitude) {
			userMarker.setLatLng(currentPosition.latitude, currentPosition.longitude);
			userPosition = currentPosition;
			Positions.insert(currentPosition);
			console.info("Moved Marker "+currentPosition.latitude + ', ' + currentPosition.longitude);
		}
	} else {
		userPosition = currentPosition;
		userMarker = L.marker([currentPosition.latitude, currentPosition.longitude]).addTo(trackerMap);
		console.info("Inserted Marker "+currentPosition.latitude + ', ' + currentPosition.longitude);
	}
}

function positionErrorHandler() {
	window.alert("error getting position");
	return;
}

Template.track.isTracking = function _trackHelperIsTracking() {
	var isTracking = Session.get('isTracking');
	return isTracking === true;
};

Template.track.positions = function _TemplateTrackPositions() {
	return Positions.find({}, {sort: {userId: 1, timestamp: 1}});
}
Template.track.rendered = function () {
	console.log("Template.track.rendered");
	var currentPosition = Positions.findOne({userId: Meteor.userId()}, {sort: {timestamp: -1}});
	if (currentPosition) {
		console.log("Template.track.rendered currentPosition:");
		if (currentPosition.lat != userPosition.lat || currentPosition.lon != userPosition.lon) {
			if (userMarker) {
				userMarker = L.marker([position.latitude, position.longitude]).addTo(trackerMap);
			} else {
				userMarker.setLatLng(position.latitude, position.longitude);
			}
			userPosition = currentPosition;
		}
	}
}

Template.track.events({
	'click .stopTrackingButton': function _TemplateTrackEventsClickStopTrackingButton() {
		var trackingName = document.getElementById('name').value;
		console.log('stopped tracking '+trackingName);
		navigator.geolocation.clearWatch(watchid);
		Session.set('isTracking',false);
	},

	'click .trackThisPhoneButton': function _TemplateTrackEventsClickTrackButton() {
		var trackingName = document.getElementById('name').value;

		Meteor.subscribe("PositionsForThisUserId",Meteor.userId);

		console.info(Meteor.userId+" trackThisPhone "+trackingName);

		if (window.DeviceMotionEvent) {
			console.log("Device Motion supported");
			Session.set('hasMotionEvents',true);
			var current_motion = null;
			var sample_frequency = 100; // sample every 100usec

			// set the event handler to detect acceleration
			window.addEventListener("devicemotion",function(event) {
				Session.set("current_motion",event);
			},false);

			// set acceleration detection timer 
			window.setInterval(function() {
				var current_motion = Session.get("current_motion");
				if (current_motion !== null) {
					deviceMotionHandler(current_motion);
				}
			},sample_frequency);

			// set the event handler to detect geolocation
			watchid = navigator.geolocation.watchPosition(
				newPositionHandler,
				positionErrorHandler,
				{'enableHighAccuracy':true,'timeout':10000,'maximumAge':20000});
			Session.set('isTracking',true);
		}

		var acceleration;

		if (navigator.geolocation){
			navigator.geolocation.getCurrentPosition(newPositionHandler, positionErrorHandler, { enableHighAccuracy: true });
		} else {
			console.log("Geolocation is not supported by this browser.");
		}

		// mapping (could be done in startup?)
		if (!trackerMap) {
			var venueId = regatta.venueId;
			var venue = Venues.findOne({_id: venueId});
			console.log("venue: "+venue.lat+","+venue.lon);

			// leaflet.js setup
			L.Icon.Default.imagePath = 'packages/leaflet/images';
			var Thunderforest_Landscape = L.tileLayer('http://{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png', {
				minZoom: 1,
				maxZoom: 100,
				attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
			});

			trackerMap = L.map('map').setView([venue.lat, venue.lon], 14);
			/****
			var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
			var osmAttrib='Map data © OpenStreetMap contributors';
			var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});
			map.setView(new L.LatLng(venue.lat, venue.lon),14);
			****/
			trackerMap.addLayer(Thunderforest_Landscape);
		}
	}
});

Template.regattaAdd.events({
	'submit form': function(event) {
		event.preventDefault();
		var name = document.getElementById('name').value;
		var startDate = document.getElementById('startDate').value;
		var endDate = document.getElementById('endDate').value;
		var livePrice = document.getElementById('livePrice').value;
		var venueList = document.getElementById("venueList");
		var venueId = venueList.options[venueList.selectedIndex].value;
		var newRegatta = {
			name: name, 
			venueId: venueId, 
			livePrice: livePrice, 
			startDate: startDate, 
			endDate: endDate
		};
		var regattaId = Regattas.insert(newRegatta);

		if (regattaId) {
			newRegatta._id = regattaId;
			setRegatta(newRegatta);
			var raceCourse = {
				_id: regattaId,
				raceCourseStatus: 'CLOSED',
				officials: [],
				markers: [], // markers where timers are positioned
				races: [],
				lanes: []
			};
			RaceCourses.insert(raceCourse);

			Router.go('/regattaUpdate/'+regattaId);
		}
	}
});

Template.regattaAdd.rendered=function() {
	//https://atmospherejs.com/package/bootstrap3-datepicker
	$('#startDate').datepicker({todayBtn: true});
	$('#endDate').datepicker({todayBtn: true});
	$('#eventDate').datepicker({todayBtn: true});
}

Template.regattaAdd.venues = function() {
	return Venues.find({},{sort: {name: 1}}).fetch();
}

/**
 * parse a time like 10:00 AM and return a relative Date object
 */
function parseTime(timeStr, date) {
	if (!date) {
		date = new Date();
	}

	var time = timeStr.match(/(\d+)(?::(\d\d))?\s*(p?)/i);
	if (!time) {
		return NaN;
	}
	var hours = parseInt(time[1], 10);
	if (hours == 12 && !time[3]) {
		hours = 0;
	}
	else {
		hours += (hours < 12 && time[3]) ? 12 : 0;
	}

	date.setHours(hours);
	date.setMinutes(parseInt(time[2], 10) || 0);
	date.setSeconds(0, 0);
	return date;
}

Template.regattaUpdate.events({
	'submit form': function(e) {
		e.preventDefault();
		var regattaId = Session.get('regattaId');
		var regattaProperties = {
			venueId: $(e.target).find('[name=venueList]').val(),
			startDate: $(e.target).find('[name=startDate]').val(),
			livePrice: $(e.target).find('[name=livePrice]').val()
		}
		console.dir("regattaUpdate: " + regattaProperties);
		Regattas.update(regattaId, {$set: regattaProperties}, function(error) {
			if (error) {
				// display the error to the user
				alert(error.reason);
			} else {
				Router.go('/regattaEdit/'+regattaId);
			}
		});
	},
	'click .delete': function(e) {
		e.preventDefault();
		if (confirm("Delete this regatta?")) {
			var regattaId = Session.get('regattaId');
			Regattas.remove(regattaId);
			Session.remove('regattaId');
		}
	},
	'change .fileUpload': function(event) {
		console.log("fileUpload event: "+event.type);
		event.stopPropagation();
		event.preventDefault();
		var regattaId = Session.get('regattaId');

		var files = event.target.files || event.dataTransfer.files || document.getElementById('files');

		for (var i = 0, file; file = files[i]; i++) {
			var type = file.type;
			var race;
			var raceNumber;
			var rowingEvent;
			var rowingEventId;
			var rowingEventNumber;
			var crew;
			var team;
			var stageType;
			var raceName;
			var eventName;
			var ages;
			var crewType;
			var sex;
			var startsAt;
			var weightType;
			var stageNumber;
			var boatClasses = {
				"1X": true,
				"2+": true,
				"2-": true,
				"2X": true,
				"4+": true,
				"4-": true,
				"4X": true,
				"8+": true,
				"8X": true
			}

			if (type.indexOf("csv") > -1) {
				var reader = new FileReader();
				reader.onloadend = function(e) {
					alert("finished loading");
					// process results - reader.result.substring(1,100) );
				};
				reader.readAsText(event.target.files[0]);
			} else
				if (file.name.match(/^.*\.evt$/)) {
					var reader = new FileReader();

					// wait until the entire file has been loaded into a String
					reader.onloadend = function _evtFileReaderOnLoadEnd (e) {

						// split the String into an array of lines
						var data = reader.result;
						var lines = data.split(/\r*\n/);

						// process the lines
						var lineIndex = 0;
						while (lineIndex < lines.length) {
							var line = lines[lineIndex];

							if (!line) break;

							var tokens = line.split(/,/);
							var newRowingEvent = (rowingEventNumber != tokens[0]);
							rowingEventNumber = tokens[0].trim();
							stageType = tokens[1].trim();
							raceNumber = tokens[2].trim();
							var name = tokens[3].split(/ /);
							startsAt = parseTime(name[2]+name[3]);
							sex = name[4].trim();

							if (name[5] == 'Ltwt' || name[5] == 'Hwt') {
								weightType = name[5];
								if (boatClasses[name[6]]) {
									ages = '';
									crewType = name[6];
									stageType = name[7];
									stageNumber = name[8];
								} else {
									ages = name[6];
									crewType = name[7];
									stageType = name[8] ? name[8] : '';
									stageNumber = name[9] ? name[9] : '';
								} 
							} else {
								weightType = '';
								if (boatClasses[name[5]]) {
									ages = '';
									crewType = name[5];
									stageType = name[6];
									stageNumber = name[7];
								} else {
									ages = name[5];
									crewType = name[6];
									stageType = name[7] ? name[7] + ' ' : '';
									stageNumber = name[8] ? name[8] + ' ' : '';
								} 
							}
							eventName = 
								(sex ? sex + ' ' : '')
							+ (weightType ? weightType + ' ' : '') 
							+ (ages ? ages + ' ' : '') 
							+ crewType;
							raceName = 
								raceNumber + ' '
							+ eventName + ' '
							+ (stageType ? stageType + ' ' : '') 
							+ (stageNumber ? stageNumber + ' ' : '');

							if (newRowingEvent) {
								rowingEventId = regatta.name.replace(/\s/g,'_') + '-' + rowingEventNumber;

								var selector = {_id: rowingEventId};
								console.log('rowingEventsUpsert id: "'+rowingEventId+'"');
								rowingEvent = RowingEvents.findOne(selector);
								var data = {
									regattaId: regattaId,
									number: rowingEventNumber,
									name: eventName, 
									rowingEventStatus: 'pending', 
									sex: sex, 
									ages: ages, 
									weightType: weightType, 
									crewType: crewType
								};
								if (rowingEvent) {
									RowingEvents.update(selector, {$set: data});
								} else {
									data._id = rowingEventId;
									RowingEvents.insert(data);
								}

								rowingEvent = RowingEvents.findOne(selector);

								if (!rowingEvent) {
									alert('rowingEventsUpsert _id: "'+rowingEventId+'" failed, .evt file upload aborted!');
									return;
								}
							}

							// process crew data
							var crews = [];

							while (true) { 
								++lineIndex;
								if (lineIndex >= lines.length) break; // finished reading data

								var raceLine = lines[lineIndex];
								if (!raceLine) break; // finished reading data

								elements = raceLine.split(/,/); 

								if (elements[0]) break; // next RowingEvent

								var bowNumber = elements[2].trim();
								var lastName = elements[3].trim();
								var firstName = elements[4].trim();
								var crewName = elements[5].trim().replace(/\/null/g,'');
								var teamName = crewName.substring(0, crewName.lastIndexOf('(') - 1).trim().replace(/ [A-Z]$/,'');
								crews[crews.length] = {
									bowNumber: bowNumber,
									name: crewName,
									team: teamName
								};

								// if a new team create it or add boat
								var teamAbbrev = teamName.replace(/\/|\s/g,'_');
								var teamId = regattaId + '-' + teamAbbrev;
								selector = {regattaId: regattaId, name: teamName};
								var team = Teams.findOne(selector);
								var boatIsNew = true;
								var boats = [];
								if (team) {
									if (team.boats) {
										boats = team.boats;
										for (var i=0; i < boats.length ; i++) {
											if (boats[i] == crewName) {
												boatIsNew = false;
												break;
											}
										}
									}
								}

								if (team && boatIsNew) {
									boats.push(crewName);
									Teams.update({_id: teamId} ,{$set: {boats: boats.sort()}});
								} else if (!team) {
									console.log('teams Insert _id:' + teamId);
									if (boats.length == 0) boats.push(crewName);
									Teams.insert({
										_id: teamId,
										regattaId: regattaId,
										abbrev: teamAbbrev,
										name: teamName,
										shortName: teamName,
										boats: boats.sort()
									});
									team = Teams.findOne(selector);
									if (!team) {
										alert('teams insert _id: "'+teamId+'"" failed, .evt file upload aborted!');
										return;
									}
								}
							}

							raceNumber = tokens[2];
							raceId = rowingEventId + '-' + raceNumber;
							var selector = {_id: raceId};
							console.log('racesUpsert _id: "' + raceId + '"');
							var data = {
								regattaId: regattaId,
								rowingEventId: rowingEventId, 
								number: raceNumber,
								name: raceName, 
								startsAt: startsAt,
								startMarker: null,
								stageType: stageType,
								stageNumber: stageNumber,
								raceStatus: 'pending',
								crews: crews
							};
							var race = Races.findOne(selector);
							if (race) {
								Races.update(selector,{$set: data});
							} else {
								data._id = raceId;
								Races.insert(data);
							}
							race = Races.findOne(selector);

							if (!race) {
								alert('racesUpsert failed, .evt file upload aborted!');
								return;
							}
						}
						alert("finished loading events\n"+lines.length+" lines");
					}; // end of function reader.onloadend

					reader.readAsText(event.target.files[0]);
				}
		}
	}
});

Template.regattaUpdate.venues = function() {
	return Venues.find({},{sort: {name: 1}}).fetch();
}

Template.regattaUpdate.rendered=function() {
	//https://atmospherejs.com/package/bootstrap3-datepicker
	$('#startDate').datepicker();
}

Template.regattaUpdate.selected = function(one,two) {
	var selectedAttribute = '';
	if (one == two) {
		selectedAttribute = 'selected';
	}
	return selectedAttribute;
}

//client/views/posts
Template.home.events({
	'click .chooseButton': function _TemplateHomeEventsClickChooseButton(){
		setRegatta(this);
		Router.go('/rowingEvents');
	}
});

Template.venue.events({
	'submit form' : function _TemplateVenueEventsSubmitForm(evt, tmpl) {
		/*****
    var email = tmpl.find('input').value, doc = {email: email, referrer: document.referrer, timestamp: new Date()}

    if (EMAIL_REGEX.test(email)){
    Session.set("showBadEmail", false);
    Emails.insert(doc);
    Session.set("emailSubmitted", true);
    } else {
    Session.set("showBadEmail", true);
    }
   *****/
		return false;
	}
});

Accounts.ui.config({
	passwordSignupFields: 'EMAIL_ONLY'
});

// When a user logs in send them home
/****
  Deps.autorun(function _DepsAutorun() {
  if (Meteor.user()) {
  console.log("_DepsAutoRun() - go home");
  Router.go(Router.path('home'));
  }
  });
 *****/

/***
  AdminUser.deletingUser = function(id) {
  if (console) {
  console.log("Deleting user " + id);
  }
  return true;
  };

  AdminUser.savingUser = function(id, template) {
  if (console) {
  console.log("Saving user " + id);
  }
// set AdminUser.customUserProps with any custom properties you want to set
return true;
};
 ***/
