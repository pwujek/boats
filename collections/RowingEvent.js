// RowingEvent.js
/**
* EJSON record definition describes a single rowing event at a single regatta.
* @module RowingEvent
*/

/**
* RowingEvent constructor.
*
* @method RowingEvent
* @param {String} Regatta._id of the Regatta this RowingEvent is a member of.
* @param {String} name of the RowingEvent
* @param {String} raceCourseId of RaceCourse to use
* @param {String} rowingEventStatus oneOf: ['PENDING','RESTART','RESCHEDULED','STARTED','FINISHED','OFFICIAL','PROTESTED','CANCELLED']
* @param {String} sex of the crews oneOf: ['MALE','FEMALE','MIXED']
* @param {Object} ages array of age codes
* @param {String} weightType oneOf: ['LWT','OPEN']
* @param {String} crewType
* @param {Object} array of Crew._id of crews racing.
* @param {Object} array of Notices that can be displayed in relation to race.
* @param {Object} array of awards entered.
* @return {RowingEvent} Returns a fully constructed RowingEvent
*/
RowingEvent = function (regattaId, name, raceCourseId, rowingEventStatus, sex, ages, weightType, crewType, crews, notices, awards) {
	self = this;
	self.regattaId = regattaId;
	self.name = name;
	self.raceCourseId = raceCourseId;
	self.rowingEventStatus = rowingEventStatus;
	self.sex = sex;
	self.ages = ages;
	self.weightType = weightType;
	self.crewType = crewType;
	self.crews = crews;
	self.notices = notices;
	self.awards = awards;
}

/**
* Class describes a single rowing event at a single regatta.
*
* @class RowingEvent
* @constructor
*/
_.extend(RowingEvent.prototype, {
	constructor: RowingEvent,

	toString: function () {
		self = this;
		regatta = Regatta.find(self.regattaId);
		rowingEvent = RowingEvent.find(self.name);
		return regatta.name 
		+ ' - RowingEvent ' 
		+ self.sex + ' - ' 
		+ self.ages + ' - ' 
		+ rowingEvent.name + ' ' 
		+ self.weightType + ' ' 
		+ self.crewType;
	},

	/**
  * Return a copy of this object.
  *
  * @method clone
  * @return {RowingEvent} shallow copy of this object
  */
	clone: function () {
		self = this;
		return new RowingEvent(self.regattaId, self.name, self.racerCourseId, self.rowingEventStatus, self.sex, self.ages, self.weightType, self.crewType, self.crews, self.notices, self.awards);
	},

	/**
  * Compare this instance to another instance.
  *
  * @method equals
  * @return {Boolean} returns True when equal
  */
	equals: function (other) {
		if (!(other instanceof RowingEvent))
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
		return "RowingEvent";
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
			name: self.name,
			raceCourseId: self.raceCourseId,
			rowingEventStatus: self.rowingEventStatus,
			sex: self.sex,
			ages: EJSON.toJSONValue(self.ages),
			weightType: self.weightType,
			crewType: self.crewType,
			crews: EJSON.toJSONValue(self.crews),
			notices: EJSON.toJSONValue(self.notices),
			awards: EJSON.toJSONValue(self.awards)
		};
	}
});

// Tell EJSON about our new custom type
EJSON.addType("RowingEvent", function (value) {
	return new RowingEvent(value.regattaId, value.name, value.raceCourseId, value.rowingEventStatus, value.sex, value.ages. value.weightType. value.crewType, value.crews, value.notices, value.awards);
});

RowingEvents = new Meteor.Collection("rowingEvents");

Meteor.methods({
	rowingEventsUpsert: function _rowingEventsUpsert( selector, modifier ) {
		return RowingEvents.upsert( selector, modifier );
	}
});

// only admin can update
RowingEvents.allow({
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

if (Meteor.isClient) {
	Meteor.subscribe("rowingEvents");
}

if (Meteor.isServer) {
	Meteor.publish("rowingEvents", function () {
		return RowingEvents.find();
	});
	Meteor.publish("rowingEventsForRegatta", function (regattaId) {
		return RowingEvents.find({regattaId: regattaId},{sort: {name: 1}});
	});
}