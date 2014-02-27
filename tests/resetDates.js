/**
 * change a timestamp to be on a certain date.
 */
resetDate = function (refDate, timestamp) {
    var year = refDate.getYear();
    var month = refDate.getMonth();
    var date = refDate.getDate();

    var hours = timestamp.getHour();
    var mins = timestamp.getMinutes();
    var secs = timestamp.getSeconds();
    var millis = timestamp.getMilliseconds();

    var newDate = new Date(year, month, date, hours, mins, secs, millis);
    return newDate;
}

/**
 * Updates a set of Races to start today
 */
resetRegatta = function (regattaName) {
    var regatta = Regattas.findOne({name: regattaName});
    var regattaId = regatta._id;
    var today = new Date();
    db.Races.find({regattaId: regattaId}).forEach(function (race) {
        newStartsAt = resetDate(today,race.startsAt);
        db.Races.update({_id: race._id}, {$set: {startsAt: newStartsAt}});
    });
}

resetRegatta('2013 Navy Day Regatta');
