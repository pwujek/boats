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
  UI.registerHelper('getSession', function (key) {
    return Session.get(key);
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
}
