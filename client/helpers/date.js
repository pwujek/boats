Handlebars.registerHelper("prettifyDate", function(timestamp) {
    return timestamp === undefined ? "" : timestamp.toLocaleDateString();
});

Handlebars.registerHelper("prettifyTimestamp", function(timestamp) {
    return timestamp === undefined ? "" : timestamp.toLocaleTimeString().substr(0,9);
});

Handlebars.registerHelper("prettifyTime", function(timestamp) {
    return timestamp === undefined ? "" : timestamp.toLocaleTimeString().substr(0,5);
});
