// Race.js
/**
* EJSON record definition describes a single race at a single regatta.
* @module Race
*/

/**
* Race constructor.
*
* @method Race
* @param regattaId     {String} Regatta._id of the Regatta this Race is a member of.
* @param rowingEventID {String} RowingEvent._id of the RowingEvent of this race.
* @param number        {String} ordinal of the race to display,may contain alphabetical characters
* @param startsAt      {Number} start time of race (milliseconds)
* @param stageType     {String} oneOf: ['DIVISION','FINAL','FLIGHT','HEAD','REP','SEMI-FINAL']
* @param stageNumber   {Number} 
* @param raceStatus    {String} oneOf: ['CANCELLED','FINISHED','OFFICIAL','PENDING','PROTESTED','RESCHEDULED','STARTED']
* @param crews         {Object} array of Crew._id of crews racing.
* @param notices       {Object} array of Notices that can be displayed in relation to race.
* @param protests      {Object} array of Protests entered.
* @return {Race} Returns a fully constructed Race
*/
Race = function (regattaId,rowingEventId,number,startsAt,stageType,stageNumber,raceStatus,crews,notices,protests) {
 self = this;
 self.regattaId = regattaId;
 self.rowingEventId = rowingEventId;
 self.number = number;
 self.startsAt = startsAt;
 self.stageType = stageType;
 self.stageNumber = stageNumber;
 self.raceStatus = raceStatus;
 self.crews = crews;
 self.notices = notices;
 self.protests = protests;
}

/**
* Class describes a single race at a single regatta.
*
* @class Race
* @constructor
*/
_.extend(Race.prototype,{
  constructor: Race,

  toString: function () {
   self = this;
   regatta = Regatta.find(self.regattaId);
   rowingEvent = RowingEvent.find(self.rowingEventId);
   return regatta.name + ' - Race ' + self.number + ' - ' + self.startsAt +' - ' + rowingEvent.name + ' ' + self.stageType + ' ' + self.stageNumber;
  },

  /**
  * Return a copy of this object.
  *
  * @method clone
  * @return {Race} shallow copy of this object
  */
  clone: function () {
   self = this;
   return new Race(self.regattaId,self.rowingEventId,self.number,self.startsAt,self.stageType,self.stageNumber,self.raceStatus,self.crews,self.notices,self.protests);
  },

  /**
  * Compare this instance to another instance.
  *
  * @method equals
  * @return {Boolean} returns True when equal
  */
 equals: function (other) {
    if (!(other instanceof Race))
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
    return "Race";
  },

  /**
  * Serialize the instance into a JSON-compatible value. 
  * It could be an object,string,or 
  * whatever would naturally serialize to JSON
  * @method toJSONValue
  * @return {String} returns JSON
  */
  toJSONValue: function () {
   self = this;
   return {
    regattaId: self.regattaId,
    rowingEventId: self.rowingEventId,
    number: self.number,
    startsAt: self.startsAt,
    stageType: self.stageType,
    stageNumber: self.stageNumber,
    raceStatus: self.raceStatus,
    crews: EJSON.toJSONValue(self.crews),
    notices: EJSON.toJSONValue(self.notices),
    protests: EJSON.toJSONValue(self.protests)
   };
  }
});

// Tell EJSON about our new custom type
EJSON.addType("Race",function (value) {
 return new Race(value.regattaId,value.rowingEventId,value.number,value.startsAt,value.stageType,value.stageNumber,value.raceStatus,value.crews,value.notices,value.protests);
});

Races = new Meteor.Collection("races");

/**
 * Returns Races for a Regatta.
 *
 * @method getRacesForRegatta
 * @param regattaId {String} 
 * @return {Object} Cursor to races for the regatta identified.
 */
function getRacesForRegatta(regattaId) {
 return Races.find({regattaId:regattaId},[{sort:{startsAt:1}}]);
}

/**
 * Returns Races for RowingEvent
 *
 * @method getRacesForRowingEvent
 * @param rowingEventId {String} 
 * @return {Object} Cursor to races for the rowing event identified.
 */
function getRacesForRowingEvent(rowingEventId) {
 return Races.find({rowingEventId:rowingEventId},[{sort: {startsAt: 1}}]);
}

/**
 * Returns all Races
 *
 * @method getAllRaces
 * @return {Object} Cursor to races
 */
function getAllRaces() {
 return Races.find({},[{sort:{regattaId:1,startsAt:1}}]);
}

/************************ Client *********************************************/
if (Meteor.isClient) {

 if (Roles.userIsInRole(Meteor.userId(),['admin'])) {
  Meteor.subscribe("races");
 }

 Deps.autorun(function () {
  if (Meteor.user()) {
   regatta = UserSession.get('regatta',Meteor.userId());
   if (regatta) {
    Meteor.subscribe("racesForRegatta",regatta._id);
   }
  }
 });
}
/*****************************************************************************/

/************************ Server *********************************************/
if (Meteor.isServer) {

 Meteor.publish('races',function() {
  return getAllRaces();
 });

 Meteor.publish('racesForRegatta',function(regatta) {
  return getRacesForRegatta(regatta);
 });
 
}
/*****************************************************************************/
