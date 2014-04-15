Template.logout.events({
	'click input[type=button]': function _TemplateLogoutEventsClickButton(){
		Meteor.logout();
	}
});
