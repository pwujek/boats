
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
	// ensure user logged in and* email verified
	authenticate: function _filtersAuthenticate() {
		var user;

		if (Meteor.loggingIn()) {
			console.log('filter: loading');
			this.render('loading');
			this.layout = 'layout_no_header';
			this.pause();
		} else {
			user = Meteor.user();

			if (!user) {
				console.log('filter: signin');
				this.render('login');
				this.layout = 'layout_no_header';
				this.pause();
				return
			}

			if (!emailVerified(user)) {
				console.log('filter: awaiting-verification');
				this.render('awaiting-verification');
				this.layout = 'layout';
				this.pause();
			} else {
				console.log('filter: done');
				this.layout = 'layout';
			}
		}
	},  // end authenticate

	// always require a regatta to begin, what if there are none?
	regattaNotYetChosen: function _filtersRegattaNotChosen() {
		var regattaId = UserSession.get('regattaId');
		if (!regattaId) {
			console.log('no regatta chosen')
			this.render('regattas');
			this.layout = 'layout_no_header';
			this.pause();
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
			this.pause();
		}
	} else {
		regattaId = null;
		console.log('no regatta chosen - showing home template');
		// render the login template but keep the url in the browser the same
		this.render('home');

		// stop the rest of the before hooks and the action function
		this.pause();
	}
}

// always checked for logged in before routing to another panel
Router.onBeforeAction(forceLogin,{except:['home',
										  'login',
										  'signup',
										  'forgotPassword',
										  'adminusers',
										  'notfound',
										  'deleteUserDialog',
										  'editUserDialog',
										  'infoUserDialog']});

Router.map(function _routerMap() {

	this.route('home', {
		path: '/',
		template: 'regattas',

		waitOn: function _routerMapHomeWaitOn() {
			return Meteor.subscribe('regattas');
		},

		data: function _homeData() { return Regattas.find({}); },

		fastRender: true
	});

	this.route('login', {
		path: '/login',

		waitOn: function _routerMapLoginWaitOn() {
			return Meteor.subscribe('users');
		},

		fastRender: true
	});

	this.route('drawCourse', {
		path: '/drawCourse/:_id',
		data: function _drawCourseVenueData() { return Venues.findOne({_id: this.params._id}); },
		notFoundTemplate: 'venueNotFound',
	});

	this.route('raceCourses', {
		path: '/raceCourses/:regattaId',
		template: 'raceCourseForRegatta',

		waitOn: function _routerMapRaceCoursesWaitOn() {
			return Meteor.subscribe('raceCourseForRegatta',UserSession.get('regattaId'));
		},

		data: function _routerMapRaceCoursesData() {
			return RaceCourses.findOne({_id: this.params.regattaId});
		}
	});

	this.route('races', {
		path: '/races',

		waitOn: function _routerMapHomeWaitOn() {
			return Meteor.subscribe('races');
		},

		fastRender: true,

		data: function _routerMapProfileData() {
			return Races.find({regattaId: regattaId });
		}
	});

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

	this.route('race', {
		path: '/races/:_id',
		notFoundTemplate: 'raceNotFound',

		waitOn: function _routerMapRaceWaitOn() {
			return Meteor.subscribe('races');
		},

		data: function _routerMapRaceData() {
			return Races.findOne({_id: this.params._id});
		}
	});

	this.route('stroke', {
		path: '/stroke'
	});

	this.route('teams', {
		path: '/teams'
	});

	this.route('team', {
		path: '/teams/:_id',
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
	});

	this.route('competitor', {
		path: '/competitors/:_id',

		waitOn: function _routerMapCompetitorsWaitOn() {
			return Meteor.subscribe('competitors');
		},

		data: function _routerMapCompetitorsData() {
			return Competitorss.findOne({_id: this.params._id});
		}
	});

	this.route('crews', {
		path: '/crews'
	});

	this.route('crew', {
		path: '/crews/:_id',
		notFoundTemplate: 'crewNotFound',

		waitOn: function _routerMapCrewWaitOn() {
			return Meteor.subscribe('crews');
		},

		data: function _routerMapCrewData() {
			return Crews.findOne({_id: this.params._id});
		}
	});

	this.route('regattas', {
		path: '/regattas'
	});

	this.route('regatta', {
		path: '/regattas/:_id',
		notFoundTemplate: 'regattaNotFound',

		waitOn: function _routerMapRegattaWaitOn() {
			return Meteor.subscribe('regattas');
		},

		data: function _routerMapRegattaData() {
			return Regattas.findOne({_id: this.params._id});
		}
	});

	this.route('regattaAdd', {
		path: '/regattaAdd'
	});

	this.route('regattaUpdate', {
		path: '/regattaUpdate/:_id',
		data: function _routerMapRegattaData() { return Regattas.findOne({_id: this.params._id}); }
	});

	this.route('venues', {
		path: '/venues'
	});

	this.route('venue', {
		path: '/venues/:_id',
		notFoundTemplate: 'venueNotFound',

		waitOn: function _routerMapVenueWaitOn() {
			return Meteor.subscribe('venues');
		},

		data: function _routerMapVenueData() {
			return Venues.findOne({_id: this.params._id});
		}
	});

	this.route('venueAdd', {
		path: '/venueAdd'
	});

	this.route('venueUpdate', {
		path: '/venueUpdate/:_id',
		data: function _routerMapVenueData() { return Venues.findOne({_id: this.params._id}); },
		notFoundTemplate: 'venueNotFound',
	});

	this.route('rowingEvents', {
		path: '/rowingEvents'
	});

	this.route('track', {
		path: '/track'
	});

	this.route('tracking', {
		path: '/tracking'
	});

	this.route('rowingEvent', {
		path: '/rowingEvents/:_id',
		notFoundTemplate: 'rowingEventNotFound',

		waitOn: function _routerMapRowingEventWaitOn() {
			return Meteor.subscribe('rowingEvents');
		},

		data: function _routerMapRowingEventData() {
			return RowingEvents.findOne({_id: this.params._id});
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

	// complex route with
	// name 'notFound' that for example
	// matches '/non-sense/route/that-matches/nothing' and automatically renders
	// template 'notFound'
	// HINT:
	//// Define a global not found route as the very last route in your router
	//// Also this is different from the notFoundTemplate in your Iron Router
	//// configuration!
	this.route('notfound', {
		path: '*'
	});
});

getEventName = function _getEventName(rowingEventId) {
	rowingEvent = RowingEvents.findOne(rowingEventId);
	return rowingEvent.name;
}

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
