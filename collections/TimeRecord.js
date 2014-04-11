// TimeRecord.js
// * EJSON record definition
// * MongoDB collection instantiation

function TimeRecord (raceId, crewId, marker, timestamp, official) {
  this.raceId = raceId;
  this.crewId = crewId;
  this.marker = marker;
  this.timestamp = timestamp;
  this.official = official;
}

TimeRecord.prototype = {
  constructor: TimeRecord,

  toString: function () {
    return this.raceId + ', ' + this.crewId + ', ' + this.marker + ', ' + this.timestamp;
  },

  // Return a copy of this instance
  clone: function () {
    return new TimeRecord(this.raceId, this.crewId, this.marker, this.timestamp, this.official);
  },

  // Compare this instance to another instance
  equals: function (other) {
    if (!(other instanceof TimeRecord))
      return false;

    return this.raceId == other.raceId 
        && this.crewId == other.crewId 
        && this.marker == other.marker 
        && this.timestamp == other.timestamp
        && this.official == other.official;
  },

  // Return the name of this type which should be the same as the one
  // padded to EJSON.addType
  typeName: function () {
    return "TimeRecord";
  },

  // Serialize the instance into a JSON-compatible value. It could
  // be an object, string, or whatever would naturally serialize
  // to JSON
  toJSONValue: function () {
    return {
      raceId: this.raceId,
      crewId: this.crewId,
      marker: this.marker,
      timestamp: this.timestamp,
      official: this.official
    };
  }
};

// Tell EJSON about our new custom type
EJSON.addType("TimeRecord", function fromJSONValue(value) {
  // the parameter - value - will look like whatever we
  // returned from toJSONValue from above.
  console.log(value);
  return new TimeRecord(value.raceId, value.crewId, value.marker, value.timestamp, value.official);
});

TimeRecords = new Meteor.Collection("timeRecords");

// only admin can update
TimeRecords.allow({
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

timeRecord = new TimeRecord('1','1','START',new Date(),'ME');
timeRecord2 = new TimeRecord('1','1','500',new Date(),'HI');
TimeRecords.insert(timeRecord);
TimeRecords.insert(timeRecord2);

/************************ Client *********************************************/
if (Meteor.isClient) {
  Meteor.subscribe("timeRecords");
}
/*****************************************************************************/

/************************ Server *********************************************/
if (Meteor.isServer) {
 /***
  Meteor.publish("timeRecords", function () {
   return TimeRecords.find({});
  });
  ***/
}
/*****************************************************************************/
