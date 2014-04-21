var strokes_prevVal = 1.0;
var strokes_prevPrevVal = 1.0;
var strokes_peakLow = 0;
var strokes_peakHigh = 0;
var strokes_samplesSinceHighPeak = 0;
var strokes_samplesSinceLowPeak = 0;
var strokes = 0;

var peakMinSamplesBetween = 15;
var highLowPeakDiff = .2;
var neutral = -1.1;
var neutralLowOffset = -.04;
var neutralHighOffset = .06;
var lastPeak = 1;// 1 is low 0 is high

var strokes_prevTime = null;
var strokes_rate = null;
var strokes_fastThreshold = 100;
var strokes_slowThreshold = 6000;

function reset_stroke() {
	strokes = 0;
} 

strokemotiondetect = function _strokemotiondetect(event,handler) {
	var x, y, z;

	x = event.acceleration.x;
	y = event.acceleration.y;
	z = event.acceleration.z;

	//peakMinSamplesBetween = getSliderValue("sliderLabel1");
	//highLowPeakDiff = getSliderValue("sliderLabel2");

	var magnitude = Math.sqrt(x * x + y * y + z * z);

	if (magnitude < strokes_prevVal 
	&&  strokes_prevPrevVal < strokes_prevVal 
	&&  strokes_samplesSinceHighPeak > peakMinSamplesBetween 
	&&  strokes_prevVal > neutral + neutralHighOffset 
	&&  lastPeak == 1) 
	{
		strokes_peakHigh = strokes_prevVal;
		strokes_samplesSinceHighPeak = 0;

		if (Math.abs(strokes_peakHigh - strokes_peakLow) > highLowPeakDiff) {
			strokes++;
			handler();
		}
		lastPeak = 0;
	} else {
		strokes_samplesSinceHighPeak++;
	}

	if (magnitude > strokes_prevVal 
	&&  strokes_prevPrevVal > strokes_prevVal 
	&&  strokes_samplesSinceLowPeak > peakMinSamplesBetween 
	&&  strokes_prevVal < neutral + neutralLowOffset 
	&&  lastPeak == 0) 
	{
		strokes_peakLow = strokes_prevVal;
		strokes_samplesSinceLowPeak = 0;
		lastPeak =1;
	} else {
		strokes_samplesSinceLowPeak++;
	}

	if (magnitude != strokes_prevVal) {
		strokes_prevPrevVal = strokes_prevVal;
		strokes_prevVal = magnitude;
	}
}

Template.stroke.strokeRate = function() {
	return Session.get('strokeRate');
}

Template.stroke.rendered = new function() {
	if (!window.DeviceMotionEvent) {
 		Alerts.add('Stroke rate not available on this machine','error',{ fadeIn: 200, fadeOut: 200, autoHide: 3000 });
		return;
	}
	window.addEventListener("devicemotion", function(event) {
		strokemotiondetect(event,new function() {
			var newTime = new Date().getMilliseconds();

			if (strokes_prevTime) {
				var diffMillis = newTime - strokes_prevTime;
				if (diffMillis < strokes_fastThreshold)
					return;
				var strokeRate = 60000 / diffMillis;
				strokes_prevTime = newTime;
				Sesson.set('strokeRate',strokeRate);
			}

			strokes_prevTime = newTime;
		});
	},false);
}