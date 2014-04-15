//client/views/posts
Template.home.events({
	'click .chooseButton': function _TemplateHomeEventsClickChooseButton(){
		setRegatta(this);
		Router.go('/rowingEvents');
	}
});
