// ProgressionRule.js
/**
* EJSON record definition describes a rule used to describe a progression.
* @module ProgressionRule
*/

/**
* ProgressionRule constructor.
*
* @method ProgressionRule
* @param min       {Number} minimum number of competitors in this rule
* @param max       {Number} maximum number of competitors in this rule
* @param heats     {Number} number of heats
* @param advInHeat {Number} number of competitors that advance in each heat
* @param reps      {Number} number of reprochages
* @param advInRep  {Number} number of competitors that advance in each reprochages
* @param semis     {Number} number of semi-finals
* @param advInSemi {Number} number of competitors that advance in each semi-final
* @return {ProgressionRule} fully constructed ProgressionRule
*/
ProgressionRule = function (min,max,heats,advInHeat,reps,advInRep,semis,advInSemi) {
 self = this;
 self.min = min;
 self.max = max;
 self.heats = heats;
 self.advInHeat = advInHeat;
 self.reps = reps;
 self.advInRep = advInRep;
 self.semis = semis;
 self.advInSemi = advInSemi;
}

/**
* Class describes a single progression at a single regatta.
*
* @class ProgressionRule
* @constructor
*/
_.extend(ProgressionRule.prototype, {
  constructor: ProgressionRule,

  toString: function () {
   self = this;
   return name;
  },

  /**
  * Return a copy of this object.
  *
  * @method clone
  * @return {ProgressionRule} shallow copy of this object
  */
  clone: function () {
   self = this;
   return new ProgressionRule(self.min, self.max, self.heats, self.advInHeat, self.reps, self.advInRep, self.semis, self.advInSemi);
  },

  /**
  * Compare this instance to another instance.
  *
  * @method equals
  * @return {Boolean} returns True when equal
  */
 equals: function (other) {
    if (!(other instanceof ProgressionRule))
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
    return "ProgressionRule";
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
    numberOfLanes: self.numberOfLanes,
    rules: self.rules
   };
  }
});

// Tell EJSON about our new custom type
EJSON.addType("ProgressionRule", function (value) {
 return new ProgressionRule(value.min, value.max, value.heats, value.advInHeat, value.reps, value.advInRep, value.semis, value.advInSemi);
});
