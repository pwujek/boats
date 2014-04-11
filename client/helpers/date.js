UI.registerHelper("prettifyDate", function(timestamp) {
    return timestamp === undefined ? "" : timestamp.toLocaleDateString();
});

UI.registerHelper("prettifyTimestamp", function(timestamp) {
    return timestamp === undefined ? "" : timestamp.toLocaleTimeString().substr(0,9);
});

UI.registerHelper("prettifyTime", function(timestamp) {
    return timestamp === undefined ? "" : timestamp.toLocaleTimeString().substr(0,5);
});
