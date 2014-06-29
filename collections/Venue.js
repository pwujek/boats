// Venue.js
/**
* EJSON record definition describes a single venue at a single regatta.
* @module Venue
*/

/**
* Venue constructor.
*
* @method Venue
* @param {String} _id of this Venue.
* @param {String} RowingEvent._id of the RowingEvent of this venue.
* @param {String} address of the venue to display
* @param {Lane[]} lanes - {number: 0, }
* @param {Array} progressionLanes in order
* @param {String} markers
* @param {Number} latitude of entrance to venue
* @param {Number} longitude of entrance to venue
* @return {Venue} Returns a fully constructed Venue
*/
Venue = function (_id, name, address, timezone, lanes, progressionLanes, latitude, longitude) {
 self = this;
 self._id = _id;
 self.name = name;
 self.address = address;
 self.timezone = timezone;
 self.lanes = lanes;
 self.progressionLanes = progressionLanes;
 self.latitude = latitude;
 self.longitude = longitude;
}

/**
* Class describes a single venue at a single regatta.
*
* @class Venue
* @constructor
*/
_.extend(Venue.prototype, {
  constructor: Venue,

  toString: function () {
   self = this;
   regatta = Regatta.find(self._id);
   rowingEvent = RowingEvent.find(self.name);
   return regatta.name + ' - Venue ' + self.address + ' - ' + self.timezone +' - ' + rowingEvent.name + ' ' + self.lanes + ' ' + self.progressionLanes;
  },

  /**
  * Return a copy of this object.
  *
  * @method clongitudee
  * @return {Venue} shallow copy of this object
  */
  clongitudee: function () {
   self = this;
   return new Venue(self._id, self.name, self.address, self.timezone, self.lanes, self.progressionLanes, self.latitude, self.longitude);
  },

  /**
  * Compare this instance to another instance.
  *
  * @method equals
  * @return {Boolean} returns True when equal
  */
 equals: function (other) {
    if (!(other instanceof Venue))
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
    return "Venue";
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
    _id: self._id,
    name: self.name,
    address: self.address,
    timezone: self.timezone,
    lanes: self.lanes,
    progressionLanes: self.progressionLanes,
    latitude: self.latitude,
    longitude: self.longitude,
   };
  }
});

// Tell EJSON about our new custom type
EJSON.addType("Venue", function (value) {
 return new Venue(value._id, value.name, value.address, value.timezone, value.lanes, value.progressionLanes, value.latitude, value.longitude);
});

Venues = new Meteor.Collection("venues");

// only admin can update
Venues.allow({
	insert: function (userId, doc) {
		return true;//Roles.userIsInRole(this.userId,['admin']);
	},
	update: function(userId, docs, fields, modifier){
		return true;//Roles.userIsInRole(this.userId,['admin']);
	},
	remove: function (userId, docs){
		return true;//Roles.userIsInRole(this.userId,['admin']);
	}
});

/************************ Client *********************************************/
if (Meteor.isClient) {
  Meteor.subscribe("venues");
}
/*****************************************************************************/

/************************ Server *********************************************/
if (Meteor.isServer) {
  Meteor.publish("venues", function () {
   return Venues.find();
  });
}
/*****************************************************************************/
