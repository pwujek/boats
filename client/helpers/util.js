if (typeof Handlebars !== 'undefined') {
  Handlebars.registerHelper('getUsername', function (userId) {
    var user = _extractProfile(userId);
    if (user) {
      if (user.username)
        return user.username;
      if (user.twitterUsername)
        return user.twitterUsername;
    }
    return '[ Server ]';
  });
  Handlebars.registerHelper('getSession', function (key) {
    return Session.get(key);
  });

  Handlebars.registerHelper('isSelected', function (a, b) {
    return (a == b)?' selected': '';
  });

  Handlebars.registerHelper('isChecked', function (a, b) {
    return (a == b)?' checked': '';
  });

  Handlebars.registerHelper('isEqual', function (a, b) {
    return (a == b);
  });

  Handlebars.registerHelper('orEqual', function (a, b, c, d) {
    return ( a == b || a == c || a == d);
  });
}