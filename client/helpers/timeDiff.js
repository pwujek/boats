/**
 * Returns a mm:ss.Z string for an interval.
 * @method timeDiff
 * @param start {Number} milliseconds
 * @param end {Number} milliseconds
 * @return {String} "mm:ss.Z" for the interval.
 */
Handlebars.registerHelper("timeDiff", function(start,end) {
 if (start === undefined || end === undefined || start == end) return '0';
  
 var diff = end - start;
	var seconds = diff / 1000;
	var minutes = seconds / 60;
 seconds = seconds - (60 * minutes);
 var milliseconds = diff % 1000;

	if (minutes < 10) minutes = "0" + minutes;
	if (seconds < 10) seconds = "0" + seconds;
	if (milliseconds < 10) milliseconds = "00" + milliseconds;
	if (milliseconds < 100) milliseconds = "0" + milliseconds;

	var answer = minutes + ":" + seconds + "." + milliseconds
 return answer;
});
