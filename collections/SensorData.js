// SensorData.js
/**
* EJSON record definition describes a single SensorData.
* @module SensorData
*/

/**
* SensorData constructor.
*
* @method SensorData
* @param venueId {String} Venue._id of the test
* @param userId {String} Meteor.user()
* @param tag {String} separate identifier used for a separate set of readings.
* @param timestamp {Date} date/time of reading
* @param event {Event} raw event data
* @param error {String} message if error returned by sensor API
* @return {SensorData} Returns a fully constructed SensorData
*/
SensorData = function (venueId, userId, tag, timestamp, event, error) {
	self = this;
	self.venueId = venueId;
	self.userId = userId;
	self.tag = tag;
	self.timestamp = timestamp;// date/time of the response
	self.event = event;
	self.error = error;
}

/**
* Class describes a single SensorData object.
*
* @class SensorData
* @constructor
*/
_.extend(SensorData.prototype,{
	constructor: SensorData,

	toString: function () {
		self = this;
		return 'SensorData: { "venueId: "' + self.venueId + '", userId: "' + self.userId + '", tag: "' + self.tag + '", timestamp: ' + self.timestamp + ', event: "' + self.event  + ', error: "' + self.error + ' }';
	},

	/**
	  * Return a copy of this object.
	  *
	  * @method clone
	  * @return {SensorData} shallow copy of this object
	  */
	clone: function () {
		self = this;
		return new SensorData(self.venueId, self.userId, self.tag, self.timestamp, self.error, self.event);
	},

	/**
	* Compare this instance to another instance.
	*
	* @method equals
	* @return {Boolean} returns True when equal
	*/
	equals: function (other) {
		if (!(other instanceof SensorData))
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
		return "SensorData";
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
			_id: self._id,
			venueId: self.venueId,
			userId: self.userId,
			tag: self.tag,
			timestamp: self.timestamp,
			event: self.event,
			error: self.error
		};
	}
});

// Tell EJSON about our new custom type
EJSON.addType("SensorData",function (value) {
	return new SensorData(value.venueId, value.userId, value.tag, value.timestamp, self.event, self.error);
});

SensorData = new Meteor.Collection("SensorData");

SensorData.allow({
	insert: function (userId, doc) {
	// the user must be logged in, and the document must be owned by the user
	//return (userId && doc.userId === userId);
	return true;
	},
	update: function (userId, doc, fields, modifier) {
	// no update allowed
	return false;
	},
	remove: function (userId, doc) {
	// can only remove your own documents
	return doc.userId === userId;
	},
	fetch: ['userId']
});

SensorData.deny({
	update: function (userId, docs, fields, modifier) {
	// can't change owners
	return _.contains(fields, 'userId');
	},
	remove: function (userId, doc) {
	// can't remove locked documents
	return doc.userId !== userId;
	},
	fetch: ['locked'] // no need to fetch 'owner'
});

/**
 * Returns SensorData for a user at a user's current Regatta.
 *
 * @method getSensorDataForRegatta
 * @param userId {String}
 * @return {Object} Cursor to SensorData for the regatta identified.
 */
function getSensorDataForTag(tag) {
	return SensorData.find({tag: tag}, [{sort: {timestamp: 1}}]);
}

/**
 * Returns SensorData for a user user.
 *
 * @method getSensorDataForUser
 * @param userId {String}
 * @return {Object} Cursor to SensorData for the user identified.
 */
function getSensorDataForUser(userId) {
	return SensorData.find({userId: userId}, [{sort: {tag: 1, timestamp: 1}}]);
}

/**
 * Returns SensorData for a venue.
 *
 * @method getSensorDataForVenue
 * @param venueId {String}
 * @return {Object} Cursor to SensorData for the venue identified.
 */
function getSensorDataForVenue(venueId) {
	return SensorData.find({venueId: venueId}, [{sort: {tag: 1, userId: 1, timestamp: 1}}]);
}

/**
 * Returns all SensorData
 *
 * @method getAllSensorData
 * @return {Object} Cursor to SensorData
 */
function getAllSensorData() {
	return SensorData.find({}, [{sort: {venueId: 1, tag: 1, userId: 1, timestamp: 1}}]);
}

/***** Client ****/
if (Meteor.isClient) {

	if (Roles.userIsInRole(Meteor.userId(),['admin','official','competitor'])) {
		Meteor.subscribe("SensorData");
	}

	/*** CAN THIS BE RUN FROM iron-router ONLY?
 Deps.autorun(function () {
	if (Meteor.user()) {
	Meteor.subscribe("SensorDataForUserId",Meteor.user());
	}
 });
 ***/
}

/*** Server *****/
if (Meteor.isServer) {
	Meteor.publish('SensorData',function() {
		return getAllSensorData();
	});

	Meteor.publish('SensorDataForUserId',function(userId) {
		return getSensorDataForUserId(userId);
	});
}
