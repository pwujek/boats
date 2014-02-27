regatta = Session.get('regatta');

// use FastRender to get first page data in HTML of first load
AppController = FastRender.RouteController.extend({
  before:function _AppControllerBefore(){
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
   * nop used to illustrate multiple filters
   * use-case
   */
  testFilter: function _filtersTestFilter() {
    console.log('test filter')
  }
};  // end filters

// forces a login if the user is not currently logged in
forceLogin = function _forceLogin() {
 console.log('router.js-forceLogin');

 if (regatta) {
  console.log('router.js-forceLogin: regatta:"'+regatta.name+'"');

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
Router.before(forceLogin,{except:['home','login','signup','forgotPassword',
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
   return RaceCourses.findOne({regattaId: this.params.regattaId});
  },

  before: [
   function _routerMapRaceCoursesBefore() {
    var raceCourse = this.getData();
   }
  ]
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
  },

  before: [
   function _routerMapRaceBefore() {
    var race = this.getData();
   }
  ]
 });

 /**
  * The route's name is "teams"
  * The route's template is also "teams"
  * The default action will render the teams template
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
  },

  before: [
   function _raceMapTeamBefore() {
    var team = this.getData();
   }
  ]
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
  },

  before: [
   function _routerMapCompetitorsBefore() {
    var competitor = this.getData();
   }
  ]
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
  },

  before: [
   function _routerMapCrewBefore() {
    var crew = this.getData();
   }
  ]
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
  },

  before: [
   function _routerMapRegattaBefore() {
    var regatta = this.getData();
   }
  ]
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
  },

  before: [
   function _routerMapVenueBefore() {
    var venue = this.getData();
   }
  ]
 });

 this.route('rowingEvents', {
  path: '/rowingEvents',
  template: 'rowingEvents'
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
  },

  before: [
   function _routerMapRowingEventBefore() {
    var rowingEvent = this.getData();
   }
  ]
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
  },

  before: [
   function _routerMapTimeRecordBefore() {
    var timeRecord = this.getData();
   }
  ]
 });

 this.route('adminusers', {
  path: '/adminusers',
  template: 'update-users'
 });

 this.route('logout', {
  path: '/logout',
  template: 'login'
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

Handlebars.registerHelper('regattas', function _helperRegattas() {
 return Regattas.find({}, {sort: {date: 1}});
});

Handlebars.registerHelper('regatta', function _helperRegatta() {
 return regatta;
});

Handlebars.registerHelper('needsPaidAccess', function _helperNeedsPaidAccess() {
 if (regatta && regatta.livePrice > 0) {
  console.log('paid access required');
  return true;
 } else {
  console.log('paid access not required');
  return false;
 }
});

Handlebars.registerHelper("debug", function _helperDebug(optionalValue) { 
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

Template.raceCourseForRegatta.generateRaces = function _TemplateRaceCourseForRegattaGenerateRaces(races) {
 console.log('generateRaces ');
 sortedRaces = races.sort();
 result = ""
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

Template.raceCourseForRegatta.generateLanes = function _TemplateRaceCourseForRegattaGenerateLanes(lanes, markers) {
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

Handlebars.registerHelper('getEventName',function _helperGetEventName(rowingEventId) {
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
  return stageType + ' ' + stageNumber;
 } else {
  return "";
 }
}

Handlebars.registerHelper('getStageName',function _helperGetStageName(stageType, stageNumber) {
 return getStageName(stageType,stageNumber); 
});

Template.races.racesByRegattaId = function _TemplateRacesRacesByRegattaId() {
 return Races.find({regattaId:regatta._id},[{sort:{startsAt:1}}]);
}

Template.rowingEvents.rowingEventsByRegattaId = function _TemplateRowingEventsRowingEventsByRegattaId() {
 if (regatta) {
  return RowingEvents.find({regattaId:regatta._id},[{sort:{name:1}}]);
 }
}

Template.rowingEvent.racesByRowingEventId = function _TemplateRowingEventRacesByRowingEventId(rowingEventId) {
 return Races.find({rowingEventId:rowingEventId},[{sort:{startsAt:1}}]);
}

Template.teams.teams = function _TemplateTeamsTeams() {
 return Teams.find({}, {sort: {place: 1, bow: 1}});
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
 'click .regattas': function _TemplateUpdateRegattaNavEventsClickRegattas(){
  Router.go(Router.path("regattas"));
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
 }
});

Template.regattaAdd.events({
 'submit form': function(event) {
  event.preventDefault();
  var regatta = {
   name: $(event.target).find('[name=name]').val(),
   date: $(event.target).find('[name=date]').val(),
   livePrice: $(event.target).find('[name=livePrice]').val()
  }
  regatta._id = Regattas.insert(regatta);
  Meteor.Router.to('regattas', regatta);
 }
});

Template.regattaEdit.events({
 'submit form': function(e) {
  e.preventDefault();
  var regattaId = Session.get('regattaId');
  var regattaProperties = {
   date: $(e.target).find('[name=date]').val(),
   livePrice: $(e.target).find('[name=livePrice]').val()
  }
  Regattas.update(regattaId, {$set: regattaProperties}, function(error) {
   if (error) {
    // display the error to the user
    alert(error.reason);
   } else {
    Meteor.Router.to('regattaEdit',regattaId);
   }
  });
 },
 'click .delete': function(e) {
  e.preventDefault();
  if (confirm("Delete this regatta?")) {
   var regattaId = Session.get('regattaId');
   Regattas.remove(regattaId);
   Meteor.Router.to('regattas');
  }
 }
});

client/views/posts
Template.home.events({
 'click .chooseButton': function _TemplateHomeEventsClickChooseButton(){
  setRegatta(this);
  Router.go(Router.path('rowingEvents'));
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
