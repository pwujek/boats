/**
 * parse a time like 10:00 AM and return a relative Date object
 * @param timeStr {String} time of day, format HH:MM:SS.zzz
 * @param date {Date} to apply time to - optional defaults to current date
 */
parseTime = function _parseTime(timeStr, date) {
	if (typeof date === 'undefined') {
		date = new Date();
	}

	var time = timeStr.match(/(\d+)(?::(\d\d))?\s*(p?)/i);
	if (!time) {
		return NaN;
	}
	var hours = parseInt(time[1], 10);
	if (hours == 12 && !time[3]) {
		hours = 0;
	}
	else {
		hours += (hours < 12 && time[3]) ? 12 : 0;
	}

	date.setHours(hours);
	date.setMinutes(parseInt(time[2], 10) || 0);
	date.setSeconds(0, 0);
	return date;
}