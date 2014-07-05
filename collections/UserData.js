/*
 *  UserData.js
 * Make Meteor.Users collection available to admin users.
 */
UserData = new Meteor.Collection("userData");

if (Meteor.isServer) {
	Meteor.publish("userData", function () {
		if (this.userId) {
			return Meteor.users.find({});
		} else {
			this.ready();
		}
	});
}

if (Meteor.isClient) {
	if (Roles.userIsInRole(Meteor.userId(),['admin','official'])) {
		Meteor.subscribe("userData");
	}
}
