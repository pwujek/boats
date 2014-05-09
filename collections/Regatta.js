// Regatta.js
/**
* EJSON record definition describes a single race at a single regatta.
* @module Regatta
*/
/**
* Regatta constructor.
*
* @method Regatta
* @param {String} name of this Regatta
* @param {String} venueId - Venue._id of this race.
* @param {String} livePrice - price charged for spectator account
* @param {Object} progressionLanes - array of lanes in order for progression
* @param {Object} racedays array of RaceDays
* @param {Date} startDate - first day of regatta
* @return {Regatta} Returns a fully constructed Regatta
*/
Regatta = function (name, venueId, livePrice, lanes, progressionLanes, racedays, startDate) {
 self = this;
 self.name = name;
 self.venueId = venueId;
 self.livePrice = livePrice;
 self.lanes = lanes;
 self.progressionLanes = progressionLanes;
 self.racedays = racedays;
 self.startDate = startDate;
}

/**
* Class describes a single race at a single regatta.
*
* @class Regatta
* @constructor
*/
_.extend(Regatta.prototype,{
  constructor: Regatta,

  toString: function () {
   self = this;
   regatta = Regatta.find(self.name);
   rowingEvent = RowingEvent.find(self.venueId);
   return regatta.name 
    + ' - Regatta ' 
    + self.livePrice + ' - ' 
    + self.lanes +' - ' 
    + rowingEvent.name + ' ' 
    + self.progressionLanes + ' ' 
    + self.racedays;
  },

  /**
  * Return a copy of this object.
  *
  * @method clone
  * @return {Regatta} shallow copy of this object
  */
  clone: function () {
   self = this;
   return new Regatta( self.name, self.venueId, self.livePrice, self.lanes, self.progressionLanes, self.racedays, self.startDate);
  },

  /**
  * Compare this instance to another instance.
  *
  * @method equals
  * @return {Boolean} returns True when equal
  */
 equals: function (other) {
    if (!(other instanceof Regatta))
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
    return "Regatta";
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
    name: self.name,
    venueId: self.venueId,
    livePrice: self.livePrice,
    lanes: self.lanes,
    progressionLanes: self.progressionLanes,
    raceDays: EJSON.toJSONValue(self.raceDays),
    startDate: self.startDate   
   };
  }
});

// Tell EJSON about our new custom type
EJSON.addType("Regatta",function (value) {
 return new Regatta(value.name, value.venueId, value.livePrice, value.lanes, value.progressionLanes, value.racedays, value.startDate);
});

Regattas = new Meteor.Collection("regattas");

// only admin can update
Regattas.allow({
	insert: function (userId, doc) {
		return true;// Roles.userIsInRole(this.userId,['admin']);
	},
	update: function(userId, docs, fields, modifier){
		return true;// Roles.userIsInRole(this.userId,['admin']);
	},
	remove: function (userId, docs){
		return true;// Roles.userIsInRole(this.userId,['admin']);
	}
});

/************************ Client ****************************************/
if (Meteor.isClient) {
  Meteor.subscribe("regattas");
}
/************************************************************************/

/************************ Server ****************************************/
if (Meteor.isServer) {
  Meteor.publish("regattas", function () {
   return Regattas.find();
  });
}
/************************************************************************/
