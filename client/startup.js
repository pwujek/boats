// client/startup.js
// subscriptions, Meteor.startup code
Meteor.startup(function(){
 var logger = TLog.getLogger(TLog.LOGLEVEL_MAX,true,true); 
 logger.info('Meteor.startup','client/startup.js');

 // initialize meteor-event-hooks for login/logout detection
 Hooks.init();

 try {
  Meteor.logoutOtherClients(function () {
   user = Session.get('dlgUserName');
   if (!name) {
    name = Meteor.user.name;
   }
   logger.info(name+' logged in','client/startup.js');
  });
 } catch (ex) {
  logger.warn('Meteor.logoutOtherClients failed','client/startup.js');
  return;
 }
});
