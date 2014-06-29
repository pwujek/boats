// RaceCourse.js
/**
* EJSON record definition describes an active race course.
* @module RaceCourse
*/

/**
* RaceCourse constructor.
*
* @method RaceCourse
* @param {String} venueId - venue._id of the venue this RaceCourse is presenting.
* @param {LatLng[2]} startLine
* @param {LatLng[2]} finishLine 
* @param {Number[]} lanes - array of lanes
* @return {RaceCourse} Returns a fully constructed RaceCourse
*/
RaceCourse = function (venueId, lanes, startLine, finishLine) {
	self = this;
	self.venueId = venueId;
	self.lanes = lanes;
	self.startLine = startLine;
	self.finishLine = finishLine;
}

/**
* Class describes a single race at a single venue.
*
* @class RaceCourse
* @constructor
*/
_.extend(RaceCourse.prototype, {
	constructor: RaceCourse,

	toString: function () {
		self = this;
		venue = venue.find(self.venueId);
		rowingEvent = RowingEvent.find(self.startLine);
		return venue.name + ' - RaceCourse';
	},

	/**
  * Return a copy of this object.
  *
  * @method clone
  * @return {RaceCourse} shallow copy of this object
  */
	clone: function () {
		self = this;
		return new RaceCourse(self.venueId, self.lanes, self.startLine, self.finishLine);
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
			venueId: self.venueId,
			lanes: self.lanes,
			startLine: self.startLine,
			finishLine: self.finishLine
		};
	}
});

// Tell EJSON about our new custom type
EJSON.addType("RaceCourse", function (value) {
	return new RaceCourse(value.venueId, value.lanes, value.startLine, value.finishLine);
});

RaceCourses = new Meteor.Collection("raceCourses");

// only admin can update
RaceCourses.allow({
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
	if (Roles.userIsInRole(Meteor.userId(),['admin'])) {
		Meteor.subscribe("raceCourses");
	}

	Deps.autorun(function () {
		var id = Session.get('venueId');
		if (id) Meteor.subscribe("raceCoursesForVenue",id);
	});
}

if (Meteor.isServer) {
	Meteor.publish("raceCourses", function () {
		return RaceCourses.find();
	});

	// publish dependent documents and simulate joins
	Meteor.publish("raceCoursesForVenue", function (venueId) {
		check(venueId, String);
		return RaceCourses.find({_id: venueId});
	});
}