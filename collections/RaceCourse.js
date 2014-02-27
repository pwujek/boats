// RaceCourse.js
/**
* EJSON record definition describes an active race course.
* @module RaceCourse
*/

/**
* RaceCourse constructor.
*
* @method RaceCourse
* @param {String} regattaId - Regatta._id of the Regatta this RaceCourse is presenting.
* @param {String} raceCourseStatus - oneOf: ['OPEN','CLOSED','SUSPENDED']
* @param {Object} races - array of Races currently taking place on the course
* @param {Object} officials - array of officials { name, position } 
* @param {Object} markers - array of markers where timing officials are positioned.
* @param {Object} lanes - array of lanes {laneNumber, isInUse)
* @param {Object} notices - array of Notices.
* @param {Object} protests - array of un-resolved Protests entered.
* @return {RaceCourse} Returns a fully constructed RaceCourse
*/
RaceCourse = function (regattaId, raceCourseStatus, lanes, races, officials, markers, notices, protests) {
 self = this;
 self.regattaId = regattaId;
 self.raceCourseStatus = raceCourseStatus;
 self.lanes = lanes;
 self.races = races;
 self.officials = officials;
 self.markers = markers;
 self.notices = notices;
 self.protests = protests;
}

/**
* Class describes a single race at a single regatta.
*
* @class RaceCourse
* @constructor
*/
_.extend(RaceCourse.prototype, {
  constructor: RaceCourse,

  toString: function () {
   self = this;
   regatta = Regatta.find(self.regattaId);
   rowingEvent = RowingEvent.find(self.races);
   return regatta.name + ' - RaceCourse';
  },

  /**
  * Return a copy of this object.
  *
  * @method clone
  * @return {RaceCourse} shallow copy of this object
  */
  clone: function () {
   self = this;
   return new RaceCourse(self.regattaId, self.lanes, self.races, self.officials, self.markers, self.raceCourseStatus, self.notices, self.protests);
  },

  /**
  * Compare this instance to another instance.
  *
  * @method equals
  * @return {Boolean} returns True when equal
  */
 equals: function (other) {
    if (!(other instanceof RaceCourse))
      return false;

    return this._id == other._id;
  },

  /**
  * Return the name of this type which should be the same as 
  * the one padded to EJSON.addType.
  *
  * @method typeName
  * @return {String} returns EJSON type.
  */
  typeName: function () {
    return "RaceCourse";
  },

  /**
  * Serialize the instance into a JSON-compatible value. 
  * It could be an object, string, or 
  * whatever would naturally serialize to JSON
  * @method toJSONValue
  * @return {String} returns JSON
  */
  toJSONValue: function () {
   self = this;
   return {
    regattaId: self.regattaId,
    lanes: self.lanes,
    races: self.races,
    officials: self.officials,
    markers: self.markers,
    raceCourseStatus: self.raceCourseStatus,
    crews: EJSON.toJSONValue(self.crews),
    notices: EJSON.toJSONValue(self.notices),
    protests: EJSON.toJSONValue(self.protests)
   };
  }
});

// Tell EJSON about our new custom type
EJSON.addType("RaceCourse", function (value) {
 return new RaceCourse(value.regattaId, value.lanes, value.races, value.officials, value.markers, value.raceCourseStatus, value.crews, value.notices, value.protests);
});

RaceCourses = new Meteor.Collection("raceCourses");

/************************ Client *********************************************/
if (Meteor.isClient) {
 if (Roles.userIsInRole(Meteor.userId(),['admin'])) {
  Meteor.subscribe("raceCourses");
 }

 Deps.autorun(function () {
  Meteor.subscribe("raceCourseForRegatta",{regattaId: Session.get('regattaId')});
 });
}
/*****************************************************************************/

/************************ Server *********************************************/
if (Meteor.isServer) {
 Meteor.publish("raceCourses", function () {
  return RaceCourses.find();
 });

// publish dependent documents and simulate joins
 Meteor.publish("raceCourseForRegatta", function (regattaId) {
  check(regattaId, String);
  return RaceCourses.find({regattaId: regattaId});
 });
}
/*****************************************************************************/
