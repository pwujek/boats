Template.admin_nav.events({
	'click .users': function _TemplateAdminNavEventsClickUsers(){
		Router.go(Router.path("adminusers"));
	},
	'click .regattas': function _TemplateAdminNavEventsClickRegattas(){
		Router.go(Router.path("regattas"));
	}
});
