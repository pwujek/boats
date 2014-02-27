// Progression.js
/**
* EJSON record definition describes a single progression at a single regatta.
* @module Progression
*/

/**
* Progression constructor.
*
* @method Progression
* @param numberOfLanes {Number} ordinal of the progression to display, may contain alphabetical characters
* @param rules         {Object} Array of ProgressionRules
* @return {Progression} fully constructed Progression
*/
Progression = function (name,numberOfLanes,rules) {
 self = this;
 self.name = name;
 self.numberOfLanes = numberOfLanes;
 self.rules = rules;
}

/**
* Class describes a single progression at a single regatta.
*
* @class Progression
* @constructor
*/
_.extend(Progression.prototype, {
  constructor: Progression,

  toString: function () {
   return this.name;
  },

  /**
  * Return a copy of this object.
  *
  * @method clone
  * @return {Progression} shallow copy of this object
  */
  clone: function () {
   self = this;
   return new Progression(self.name, self.numberOfLanes, self.rules);
  },

  /**
  * Compare this instance to another instance.
  *
  * @method equals
  * @return {Boolean} returns True when equal
  */
 equals: function (other) {
    if (!(other instanceof Progression))
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
    return "Progression";
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
   var jsRules = [];

   if (_.isArray(self.rules)) {
    _.map(self.rules,function(rule) { jsRules.push(rule.toJSONValue()); });
   }

   return {
    name: self.name,
    numberOfLanes: self.numberOfLanes,
    rules: jsRules 
   };
  }
});

// Tell EJSON about our new custom type
EJSON.addType("Progression", function (value) {
 return new Progression(value.name, value.numberOfLanes, value.rules);
});

Progressions = new Meteor.Collection("progressions");

/**
 * Returns all Progressions
 *
 * @method getAllProgressions
 * @return {Object} Cursor to progressions
 */
function getAllProgressions() {
 return Progressions.find({},[{sort: {_id: 1}}]);
}

/************************ Client *********************************************/
if (Meteor.isClient) {
  Meteor.subscribe("progressions");
}
/*****************************************************************************/

/************************ Server *********************************************/
if (Meteor.isServer) {
 Meteor.publish('progressions',function() {
  return getAllProgressions();
 });
}
/*****************************************************************************/
