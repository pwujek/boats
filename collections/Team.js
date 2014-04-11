
// Team.js
/**
* EJSON record definition describes a single team
* @module Team
*/

/**
* Team constructor.
*
* @method Team
* @param {String} _id of this Team.
* @param {String} RowingEvent._id of the RowingEvent of this team.
* @param {String} shortName of the team to display
* @param {Object} array of Boats
* @return {Team} Returns a fully constructed Team
*/
Team = function (_id, name, shortName, boats) {
 self = this;
 self._id = _id;
 self.name = name;
 self.shortName = shortName;
 self.boats = boats;
}

/**
* Class describes a single team at a single regatta.
*
* @class Team
* @constructor
*/
_.extend(Team.prototype, {
  constructor: Team,

  toString: function () {
   self = this;
   return self.shortName;
  },

  /**
  * Return a copy of this object.
  *
  * @method clone
  * @return {Team} shallow copy of this object
  */
  clone: function () {
   self = this;
   return new Team(self._id, self.name, self.shortName, self.boats);
  },

  /**
  * Compare this instance to another instance.
  *
  * @method equals
  * @return {Boolean} returns True when equal
  */
 equals: function (other) {
    if (!(other instanceof Team))
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
    return "Team";
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
    shortName: self.shortName,
    boats: self.boats   
   };
  }
});

// Tell EJSON about our new custom type
EJSON.addType("Team", function (value) {
 return new Team(value._id, value.name, value.shortName, value.boats);
});

Teams = new Meteor.Collection("teams");

// only admin can update
Teams.allow({
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

/************************ Client *********************************************/
if (Meteor.isClient) {
  Meteor.subscribe("teams");
}
/*****************************************************************************/

/************************ Server *********************************************/
if (Meteor.isServer) {
  Meteor.publish("teams", function () {
   return Teams.find({},{sort: {name: 1}});
  });
}
/*****************************************************************************/
