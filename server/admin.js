createUserAdminRoles = function() {
}

// Users added by the GUI are initially only spectators
Accounts.onCreateUser(function(options, user) {
 if(!options || !user) {
  logger.error('error creating user '+user.name);
  return;
 } else {
  if(options.profile) {
   user.profile = options.profile;
  }
 }

 if (_.contains(user.roles,'spectator') == false) {
  if (user.roles)
   user.roles.push('spectator');
  else
   user.roles = [ 'spectator' ];
 }

 if (user.name == undefined && user.email != undefined) {
  user.name = user.email.substr(0,user.email.indexOf('@'));
 }
 return user;
});

Meteor.startup(function () {
 Roles.addUsersToRoles("PW", ["admin", "user-admin"]);  
 createUserAdminRoles();
});

Hooks.onLoggedIn = function (userId) {
 user = Meteor.users.findOne(userId);
 regatta = Regattas.findOne();
 UserSession.set('regatta', regatta, userId);
 logger.info(user.profile.name+" logged in, regatta: "+regatta.name,"onLoggedIn");
 logger.error('REGATTA IS STATIC - regatta must be determined',"onLoggedIn");
}

Hooks.onLoggedOut = function (userId) {
 user = Meteor.users.findOne(userId);
 if (user != undefined)
  logger.info(user.profile.name+" logged out","onLoggedOut");
}

Accounts.registerLoginHandler(function(loginRequest) {
 var userId = null;
 var user = Meteor.users.findOne({username: 'admin'});
 if(!user) {
  userId = Meteor.users.insert({username: 'admin'});
 } else {
  userId = Meteor.users.insert({username: 'admin'});

  userId = user._id;
 }

 //creating the token and adding to the user
 var stampedToken = Accounts._generateStampedLoginToken();
 Meteor.users.update(userId, 
  {$push: {'services.resume.loginTokens': stampedToken}}
  );

 //sending token along with the userId
 return {
  id: userId,
  token: stampedToken.token
 }
});

