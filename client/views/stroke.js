
var minMagnitude = 0.175;

strokeRate = {
	dep: new Deps.Dependency(),
	value: 0,
	average: 0,
	prevTime: 0,
	values: [],
	valuesToAverage: 10,
	count: 0,
	fastThreshold: 1000,
	slowThreshold: 60000,
	stopped: false,

	get: function () {
		return this.value;
	},

	set: function (newValue){
		this.value = newValue;
		return this.value;
	},

	reset: function () {
		value = 0;
		average = 0;
		prevTime = 0;
		values = [];
		valuesToAverage = 10;
		count = 0;
	},

	update: function() {
		var newTime = new Date().getTime();
		var diffMillis = newTime - this.prevTime;

		// debounce
		if (diffMillis < this.fastThreshold)
			return;

		this.value = (60000 / diffMillis);
		this.prevTime = newTime;
		this.values[this.count % this.valuesToAverage] = this.value;
		this.value = this.value.toFixed(1);
		this.average = Math.average.apply(Math, this.values).toFixed(1);
		++this.count;
		UserSession.set("strokeRate",this);
		console.log(this.count,"value:",this.value,"average:",this.average,"diffMillis",diffMillis);
		this.dep.changed();
	}
};

UserSession.set("strokeRate",strokeRate);

strokemotiondetect = function _strokemotiondetect(event,handler) {
	return strokeRate.stopped ? null : strokeDetector(event,handler);
}

Math.average = function() {
	var sum = 0;
	var count = 0;
	for (var i = 0;  i < arguments.length; i++) {
		if (arguments[i]) {
			sum += (0 + arguments[i]);
			++count;
		}
	}
	return sum / count;
}

Template.stroke.rendered = function() {
	if (!window.DeviceMotionEvent) {
		bootbox.alert('Stroke rate not available on this machine');
		return;
	}
	strokesPrevTime = new Date().getTime();

	window.addEventListener("devicemotion", function(event) {
		strokemotiondetect(event, null);
	},false);
}

// strokeDetector variables
var mLimit = .01;
var mLastValue = 0;
var mYOffset = 0;

var mLastDirection = 0;
var mLastExtreme = [ 0, 0 ];
var mLastDiff = 0;
var mLastMatch = -1;

setSensitivity = function(sensitivity) {
	mLimit = sensitivity; // 1.97  2.96  4.44  6.66  10.00  15.00  22.50  33.75  50.62
}

// implementation of a low-pass filter
var ALPHA = 0.25; // if ALPHA = 1 OR 0, no filter applies.

var accelVals = [0, 0, 0];

// low-pass filter used to smooth out the accelerometer values
var /*float[]*/ lowPass = function( /*float[]*/ input, /*float[]*/ output ) {
	if ( output == null ) return input;
	for ( var i=0; i<input.length; i++ ) {
		output[i] = output[i] + ALPHA * (input[i] - output[i]);
	}
	return output;
}

strokeDetector = function(event,handler) {
	var rawVals = [event.acceleration.x, event.acceleration.y, event.acceleration.z];
	accelVals = lowPass( rawVals, accelVals );
	//var vSum = (accelVals[0] + accelVals[1] + accelVals[2]);
	var vSum = Math.sqrt(accelVals[0]*accelVals[0] + accelVals[1]*accelVals[1] + accelVals[2]*accelVals[2]);
	var v = (vSum / 3).toFixed(1) + 0.0; // filter out very small values

	if (v < mLimit) return;

	var direction = (v > mLastValue ? 1 : (v < mLastValue ? -1 : 0));

	if (direction == - mLastDirection) {
		// Direction changed
		var extType = (direction > 0 ? 0 : 1); // minumum or maximum?
		mLastExtreme[extType] = mLastValue;
		var diff = Math.abs(mLastExtreme[extType] - mLastExtreme[1 - extType]);
		if (diff > mLimit) {
			var isAlmostAsLargeAsPrevious = diff > (mLastDiff*2/3);
			var isPreviousLargeEnough = mLastDiff > (diff/3);
			var isNotContra = (mLastMatch != 1 - extType);

			if (isAlmostAsLargeAsPrevious
			&&  isPreviousLargeEnough
			&&  isNotContra) {
				strokeRate.update();
				mLastMatch = extType;
			} else {
				mLastMatch = -1;
			}
		}
		mLastDiff = diff;
	}
	mLastDirection = direction;
	mLastValue = v;
}

Template.stroke.helpers({
	strokeRate: function () {
		return UserSession.get('strokeRate').value;
	},
	strokeRateAverage: function () {
		return UserSession.get('strokeRate').average;
	},
	strokeCount: function () {
		return UserSession.get('strokeRate').count;
	}
});

Template.stroke.events({
	'click .action': function (event) {
		if (strokeRate.stopped) {
			strokeRate.stopped = false;
			event.target.innerHTML = '<i class="glyphicon glyphicon-stop icon-black stop"></i>&nbsp;Stop';
			console.debug("click .action Stop");
		} else {
			console.debug("click .action Start");
			strokeRate.stopped = true;
			event.target.innerHTML = '<i class="glyphicon glyphicon-play icon-black start"></i>&nbsp;Start';
		}
	}
});

Template.strokeRateTemplate.rendered = function () {
	var self = this;
	Deps.autorun(function () {
		self.$('.wrapper').trigger('reactive-update');
	});
};

Template.strokeRateTemplate.events({
	'reactive-update .wrapper': function () {}
});
