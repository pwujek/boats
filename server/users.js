// Authorized users can manage user accounts
Meteor.publish("users", function () {
  var user = Meteor.users.findOne({_id:this.userId});

  if (Roles.userIsInRole(user, ["admin","manage-users"])) {
    console.log('publishing users', this.userId)
    return Meteor.users.find({}, {fields: {emails: 1, profile: 1, roles: 1}});
  }

  this.stop();
  return;
});

/** A user can have only 1 active session
 * from meteor-event-hooks
 */
Hooks.onLoggedIn = function (userId) {
}

