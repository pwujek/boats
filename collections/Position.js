// Position.js
/**
* EJSON record definition describes a single Position.
* @module Position
*/

/**
* Position constructor.
*
* @method Position
* @param userId     {String} Regatta._id of the Regatta this Position is a member of.
* @param latitude   {Float} as a decimal number
* @param longitude  {Float} as a decimal number
* @param accuracy   {Float} accuracy of position
* @param timestamp  {Date} date/time of reading
* @param error  {String} message if an error occurred
* @return {Position} Returns a fully constructed Position
*/
Position = function (regattaId, userId, latitude, longitude, accuracy, timestamp, error) {
	self = this;
	self.regattaId = regattaId;
	self.userId = userId;
	self.latitude = latitude;// 	latitude as a decimal number
	self.longitude = longitude;// 	longitude as a decimal number
	self.accuracy = accuracy;// 	accuracy of position
	self.timestamp = timestamp;// 	date/time of the response
	self.error = error;
}

/**
* Class describes a single Position at a single regatta.
*
* @class Position
* @constructor
*/
_.extend(Position.prototype,{
	constructor: Position,

	toString: function () {
		self = this;
		return 'Position: { regattaId: "' + self.regattaId + '", userId: "' + self.userId + '", latitude: ' + self.latitude + ', longitude: ' + self.longitude + ', accuracy: ' + self.accuracy + ', timestamp: ' + self.timestamp + ', error: "' + self.error + ' }';
	},

	/**
	* Return a copy of this object.
	*
	* @method clone
	* @return {Position} shallow copy of this object
	*/
	clone: function () {
		self = this;
		return new Position(self.regattaId, self.userId, self.latitude, self.longitude, self.accuracy, self.timestamp, self.error);
	},

	/**
	* Compare this instance to another instance.
	*
	* @method equals
	* @return {Boolean} returns True when equal
	*/
	equals: function (other) {
		if (!(other instanceof Position))
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
		return "Position";
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
			userId: self.userId,
			latitude: self.latitude,
			longitude: self.longitude,
			accuracy: self.accuracy,
			timestamp: self.timestamp,
			error: self.error
		};
	}
});

// Tell EJSON about our new custom type
EJSON.addType("Position",function (value) {
	return new Position(value.regattaId, value.userId, value.latitude, value.longitude, value.accuracy, value.timestamp, self.error);
});

Positions = new Meteor.Collection("Positions");

Positions.allow({
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

Positions.deny({
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
 * Returns Positions for a user at a user's current Regatta.
 *
 * @method getPositionsForRegatta
 * @param userId {String}
 * @return {Object} Cursor to Positions for the regatta identified.
 */
function getPositionsForUserAtRegatta(userId) {
	regatta = UserSession.get('regatta',Meteor.userId());
	return Positions.find({regattaId: regatta, userId: userId}, [{sort: {time: 1}}]);
}

/**
 * Returns Positions for a user at a user's current Regatta.
 *
 * @method getPositionsForRegatta
 * @param regattaId {String}
 * @return {Object} Cursor to Positions for the regatta identified.
 */
function getPositionsForRegatta(regattaId) {
	return Positions.find({regattaId: regattaId}, [{sort: {userId: 1, time: 1}}]);
}

/**
 * Returns Positions for a user at a user's current Regatta.
 *
 * @method getPositionsForUserId
 * @param userId {String}
 * @return {Object} Cursor to Positions for the user identified.
 */
function getPositionsForUserId(userId) {
	return Positions.find({userId: userId}, [{sort: {time: 1}}]);
}

/**
 * Returns all Positions
 *
 * @method getAllPositions
 * @return {Object} Cursor to Positions
 */
function getAllPositions() {
	regatta = UserSession.get('regatta',this.userId);
	return Positions.find({regattaId: regatta}, [{sort: {userId: 1, time: 1}}]);
}

/***** Client ****/
if (Meteor.isClient) {

	if (Roles.userIsInRole(Meteor.userId(),['admin','official','competitor'])) {
		Meteor.subscribe("Positions");
	}

	/*** CAN THIS BE RUN FROM iron-router ONLY?
 Deps.autorun(function () {
	if (Meteor.user()) {
	regatta = UserSession.get('regatta',Meteor.userId());
	if (regatta) {
	Meteor.subscribe("PositionsForRegatta",regatta._id);
	}
	}
 });
 ***/
}

/*** Server *****/
if (Meteor.isServer) {
	Meteor.publish('Positions',function() {
		return getAllPositions();
	});

	Meteor.publish('PositionsForUserId',function(userId) {
		return getPositionsForUserId(userId);
	});

	Meteor.publish('PositionsForRegatta',function(regattaId) {
		return getPositionsForRegatta(regattaId);
	});
}
