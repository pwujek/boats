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
		var regattaId = UserSession.get('regattaId');
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
		} 
	} else {
		regattaId = null;
		console.log('router.js-forceLogin: no regatta - going home');
		// render the login template but keep the url in the browser the same
		this.render('home');

		// stop the rest of the before hooks and the action function 
		this.stop();
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
			return Meteor.subscribe('raceCourseForRegatta',UserSession.get('regattaId'));
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
	
	this.route('stroke', {
		path: '/stroke'
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

	this.route('venueAdd', {
		path: '/venueAdd',
		template: 'venueAdd'
	});

	this.route('venueUpdate', {
		path: '/venueUpdate/:_id',
		data: function _routerMapVenueData() { return Venues.findOne({_id: this.params._id}); },
		notFoundTemplate: 'venueNotFound',
	});

	this.route('rowingEvents', {
		path: '/rowingEvents',
		template: 'rowingEvents'
	});

	this.route('track', {
		path: '/track',
		template: 'track'
	});

	this.route('tracking', {
		path: '/tracking',
		template: 'tracking'
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
