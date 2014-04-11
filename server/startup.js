// server/startup.js
// Meteor.startup code
Meteor.startup(function(){
 console.info('Meteor.startup - server','server/startup.js');

 // initialize meteor-accounts-ui
 createUserAdminRoles();
});
