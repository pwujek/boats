Template.venue.events({
	'submit form' : function _TemplateVenueEventsSubmitForm(evt, tmpl) {
		/*****
    var email = tmpl.find('input').value, doc = {email: email, referrer: document.referrer, timestamp: new Date()}

    if (EMAIL_REGEX.test(email)){
    UserSession.set("showBadEmail", false);
    Emails.insert(doc);
    UserSession.set("emailSubmitted", true);
    } else {
    UserSession.set("showBadEmail", true);
    }
   *****/
		return false;
	}
});

