/*
 * KalmanLatLon.js
 * http://stackoverflow.com/questions/1134579/smooth-gps-data
General Kalman filter theory is all about estimates for vectors, with the accuracy of the estimates represented by covariance matrices. However, for estimating location on Android devices the general theory reduces to a very simple case. Android location providers give the location as a latitude and longitude, together with an accuracy which is specified as a single number measured in metres. This means that instead of a covariance matrix, the accuracy in the Kalman filter can be measured by a single number, even though the location in the Kalman filter is a measured by two numbers. Also the fact that the latitude, longitude and metres are effectively all different units can be ignored, because if you put scaling factors into the Kalman filter to convert them all into the same units, then those scaling factors end up cancelling out when converting the results back into the original units.

The code could be improved, because it assumes that the best estimate of current location is the last known location, and if someone is moving it should be possible to use Android's sensors to produce a better estimate. The code has a single free parameter Q, expressed in metres per second, which describes how quickly the accuracy decays in the absence of any new location estimates. A higher Q parameter means that the accuracy decays faster. Kalman filters generally work better when the accuracy decays a bit quicker than one might expect, so for walking around with an Android phone I find that Q=3 metres per second works fine, even though I generally walk slower than that. But if travelling in a fast car a much larger number should obviously be used.
 */
KalmanLatLon = function KalmanLatLon (Qmps) {
	this.minAccuracy = 1;
	this.Qmps = Qmps || 3; // how quickly the accuracy decays in the face of no new location estimates
	this.ts = null;       // in milliseconds
	this.interval = null; // in milliseconds
	this.lat = null;      // decimal latitude
	this.lon = null;      // decimal longitude
	this.variance = -1;   // P matrix.  Negative means object uninitialised.  NB: units irrelevant, as var as same units used throughout
	this.K = null;        // Kalman gain matrix
}

KalmanLatLon.prototype = {
	getAccuracy: function () { return Math.sqrt(variance); },

	setState: function(lat, lon, accuracy, ts) {
		this.lat = lat; 
		this.lon = lon; 
		this.variance = accuracy * accuracy; 
		this.ts=ts;
		return this;
	},

	/// <summary>
	/// Kalman filter processing for lattitude and longitude
	/// </summary>
	/// <param name="latRaw_degrees">new measurement of latitude</param>
	/// <param name="lonRaw">new measurement of longitude</param>
	/// <param name="accuracy">measurement of 1 standard deviation error in metres</param>
	/// <param name="timestamp">time of measurement</param>
	/// <returns>new state</returns>
	process: function(latRaw, lonRaw, accuracy, timestamp) {
		if (accuracy < this.minAccuracy) accuracy = this.minAccuracy;

		if (this.variance < 0) {
			// if variance < 0, object is unitialised, so initialise with current values
			this.ts = timestamp;
			this.lat = latRaw; 
			this.lon = lonRaw; 
			this.variance = accuracy * accuracy; 
		} else {
			// else apply Kalman filter methodology
			this.interval = timestamp - this.ts;

			if (this.interval > 0) {
				// time has moved on, so the uncertainty in the current position increases
				this.variance += this.interval * this.Qmps * this.Qmps / 1000;
				this.ts = timestamp;
				// TO DO: USE VELOCITY INFORMATION HERE TO GET A BETTER ESTIMATE OF CURRENT POSITION
			}

			// Kalman gain matrix K = Covarariance * Inverse(Covariance + MeasurementVariance)
			// NB: because K is dimensionless, it doesn't matter that variance has different units to lat and lon
			this.K = this.variance / (this.variance + accuracy * accuracy);

			// apply K
			this.lat += this.K * (latRaw - this.lat);
			this.lon += this.K * (lonRaw - this.lon);

			// new Covarariance  matrix is (IdentityMatrix - K) * Covarariance 
			this.variance = (1 - this.K) * this.variance;
		}

		// return the newly calculated position
		var position = {
			lat: parseFloat(this.lat.toFixed(5)),
			lon: parseFloat(this.lon.toFixed(5)),
			accuracy: accuracy
		}

		return position;
	}
}