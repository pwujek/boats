// helpers for logical issues
//
// {{#if isEqual 'foo' 'bar'}}  //where foo is session key containing a value and bar is test value
// {{getSession 'foo'}} //returns session keys value
//
//
(function () {
	if (typeof UI !== 'undefined') {
		UI.registerHelper('getUsername', function (userId) {
			var user = _extractProfile(userId);
			if (user) {
				if (user.username)
					return user.username;
				if (user.twitterUsername)
					return user.twitterUsername;
			}
			return '[ Server ]';
		});

		UI.registerHelper('isSelected', function (a, b) {
			return (a == b)?' selected': '';
		});

		UI.registerHelper('isChecked', function (a, b) {
			return (a == b)?' checked': '';
		});

		UI.registerHelper('isEqual', function (a, b) {
			return (a == b);
		});

		UI.registerHelper('orEqual', function (a, b, c, d) {
			return ( a == b || a == c || a == d);
		});

		/*
		 * Returns a default value if value is null or undefined.
		 * @param value
		 * @param defaultValue
		 */
		UI.registerHelper('orDefault', function (value,defaultValue) {
			return value || defaultValue;
		});
	}
});