(function () {
	var GeoJsonUtils = this.GeoJsonUtils = {};

	// Export the geojson object for **CommonJS**
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = GeoJsonUtils;
	} else if (typeof window !== 'undefined') {
		window.GeoJsonUtils = GeoJsonUtils;
	}

	// adapted from http://www.kevlindev.com/gui/math/intersection/Intersection.js
	GeoJsonUtils.lineStringsIntersect = function (l1, l2) {
		var intersects = [];
		for (var i = 0; i <= l1.coordinates.length - 2; ++i) {
			for (var j = 0; j <= l2.coordinates.length - 2; ++j) {
				var a1 = {
					x: l1.coordinates[i][1],
					y: l1.coordinates[i][0]
				},
					a2 = {
						x: l1.coordinates[i + 1][1],
						y: l1.coordinates[i + 1][0]
					},
					b1 = {
						x: l2.coordinates[j][1],
						y: l2.coordinates[j][0]
					},
					b2 = {
						x: l2.coordinates[j + 1][1],
						y: l2.coordinates[j + 1][0]
					},
					ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
					ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
					u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
				if (u_b != 0) {
					var ua = ua_t / u_b,
						ub = ub_t / u_b;
					if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
						intersects.push({
							'type': 'Point',
							'coordinates': [a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)]
						});
					}
				}
			}
		}
		if (intersects.length == 0) intersects = false;
		return intersects;
	}

	// Bounding Box

	function boundingBoxAroundPolyCoords (coords) {
		var xAll = [], yAll = []

		for (var i = 0; i < coords[0].length; i++) {
			xAll.push(coords[0][i][1])
			yAll.push(coords[0][i][0])
		}

		xAll = xAll.sort(function (a,b) { return a - b })
		yAll = yAll.sort(function (a,b) { return a - b })

		return [ [xAll[0], yAll[0]], [xAll[xAll.length - 1], yAll[yAll.length - 1]] ]
	}

	GeoJsonUtils.pointInBoundingBox = function (point, bounds) {
		return !(point.coordinates[1] < bounds[0][0] || point.coordinates[1] > bounds[1][0] || point.coordinates[0] < bounds[0][1] || point.coordinates[0] > bounds[1][1]) 
	}

	// Point in Polygon
	// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html#Listing the Vertices

	function pnpoly (x,y,coords) {
		var vert = [ [0,0] ]

		for (var i = 0; i < coords.length; i++) {
			for (var j = 0; j < coords[i].length; j++) {
				vert.push(coords[i][j])
			}
			vert.push(coords[i][0])
			vert.push([0,0])
		}

		var inside = false
		for (var i = 0, j = vert.length - 1; i < vert.length; j = i++) {
			if (((vert[i][0] > y) != (vert[j][0] > y)) && (x < (vert[j][1] - vert[i][1]) * (y - vert[i][0]) / (vert[j][0] - vert[i][0]) + vert[i][1])) inside = !inside
				}

		return inside
	}

	GeoJsonUtils.pointInPolygon = function (p, poly) {
		var coords = (poly.type == "Polygon") ? [ poly.coordinates ] : poly.coordinates

		var insideBox = false
		for (var i = 0; i < coords.length; i++) {
			if (GeoJsonUtils.pointInBoundingBox(p, boundingBoxAroundPolyCoords(coords[i]))) insideBox = true
				}
		if (!insideBox) return false

		var insidePoly = false
		for (var i = 0; i < coords.length; i++) {
			if (pnpoly(p.coordinates[1], p.coordinates[0], coords[i])) insidePoly = true
				}

		return insidePoly
	}

	// support multi (but not donut) polygons
	GeoJsonUtils.pointInMultiPolygon = function (p, poly) {
		var coords_array = (poly.type == "MultiPolygon") ? [ poly.coordinates ] : poly.coordinates

		var insideBox = false
		var insidePoly = false
		for (var i = 0; i < coords_array.length; i++){
			var coords = coords_array[i];
			for (var j = 0; j < coords.length; j++) {
				if (!insideBox){
					if (GeoJsonUtils.pointInBoundingBox(p, boundingBoxAroundPolyCoords(coords[j]))) {
						insideBox = true
					}
				}
			}
			if (!insideBox) return false
			for (var j = 0; j < coords.length; j++) {
				if (!insidePoly){
					if (pnpoly(p.coordinates[1], p.coordinates[0], coords[j])) {
						insidePoly = true
					}
				}
			}
		}

		return insidePoly
	}

	GeoJsonUtils.toRad = function toRad(number) {
		return number * Math.PI / 180;
	}

	GeoJsonUtils.toDeg = function toDeg(number) {
		return number * 180 / Math.PI;
	}

	// written with help from @tautologe
	GeoJsonUtils.drawCircle = function (radiusInMeters, centerPoint, steps) {
		var center = [centerPoint.coordinates[1], centerPoint.coordinates[0]],
			dist = (radiusInMeters / 1000) / 6371,
			// convert meters to radiant
			radCenter = [GeoJsonUtils.toRad(center[0]), GeoJsonUtils.toRad(center[1])],
			steps = steps || 15,
			// 15 sided circle
			poly = [[center[0], center[1]]];
		for (var i = 0; i < steps; i++) {
			var brng = 2 * Math.PI * i / steps;
			var lat = Math.asin(Math.sin(radCenter[0]) * Math.cos(dist)
								+ Math.cos(radCenter[0]) * Math.sin(dist) * Math.cos(brng));
			var lng = radCenter[1] + Math.atan2(Math.sin(brng) * Math.sin(dist) * Math.cos(radCenter[0]),
												Math.cos(dist) - Math.sin(radCenter[0]) * Math.sin(lat));
			poly[i] = [];
			poly[i][1] = GeoJsonUtils.toDeg(lat);
			poly[i][0] = GeoJsonUtils.toDeg(lng);
		}
		return {
			"type": "Polygon",
			"coordinates": [poly]
		};
	}

	// assumes rectangle starts at lower left point
	GeoJsonUtils.rectangleCentroid = function (rectangle) {
		var bbox = rectangle.coordinates[0];
		var xmin = bbox[0][0],
			ymin = bbox[0][1],
			xmax = bbox[2][0],
			ymax = bbox[2][1];
		var xwidth = xmax - xmin;
		var ywidth = ymax - ymin;
		return {
			'type': 'Point',
			'coordinates': [xmin + xwidth / 2, ymin + ywidth / 2]
		};
	}

	// from http://www.movable-type.co.uk/scripts/latlong.html
	GeoJsonUtils.pointDistance = function (pt1, pt2) {
		var lon1 = pt1.coordinates[0],
			lat1 = pt1.coordinates[1],
			lon2 = pt2.coordinates[0],
			lat2 = pt2.coordinates[1],
			dLat = GeoJsonUtils.toRad(lat2 - lat1),
			dLon = GeoJsonUtils.toRad(lon2 - lon1),
			a = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(GeoJsonUtils.toRad(lat1))
		* Math.cos(GeoJsonUtils.toRad(lat2)) * Math.pow(Math.sin(dLon / 2), 2),
			c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return (6371 * c) * 1000; // returns meters
	}

	// checks if geometry lies entirely within a circle
	// works with Point, LineString, Polygon
	GeoJsonUtils.geometryWithinRadius = function (geometry, center, radius) {
		if (geometry.type == 'Point') {
			return GeoJsonUtils.pointDistance(geometry, center) <= radius;
		} else if (geometry.type == 'LineString' || geometry.type == 'Polygon') {
			var point = {};
			var coordinates;
			if (geometry.type == 'Polygon') {
				// it's enough to check the exterior ring of the Polygon
				coordinates = geometry.coordinates[0];
			} else {
				coordinates = geometry.coordinates;
			}
			for (var i in coordinates) {
				point.coordinates = coordinates[i];
				if (GeoJsonUtils.pointDistance(point, center) > radius) {
					return false;
				}
			}
		}
		return true;
	}

	// adapted from http://paulbourke.net/geometry/polyarea/javascript.txt
	GeoJsonUtils.area = function (polygon) {
		var area = 0;
		// TODO: polygon holes at coordinates[1]
		var points = polygon.coordinates[0];
		var j = points.length - 1;
		var p1, p2;

		for (var i = 0; i < points.length; j = i++) {
			var p1 = {
				x: points[i][1],
				y: points[i][0]
			};
			var p2 = {
				x: points[j][1],
				y: points[j][0]
			};
			area += p1.x * p2.y;
			area -= p1.y * p2.x;
		}

		area /= 2;
		return area;
	}

	// adapted from http://paulbourke.net/geometry/polyarea/javascript.txt
	GeoJsonUtils.centroid = function (polygon) {
		var f, x = 0,
			y = 0;
		// TODO: polygon holes at coordinates[1]
		var points = polygon.coordinates[0];
		var j = points.length - 1;
		var p1, p2;

		for (var i = 0; i < points.length; j = i++) {
			var p1 = {
				x: points[i][1],
				y: points[i][0]
			};
			var p2 = {
				x: points[j][1],
				y: points[j][0]
			};
			f = p1.x * p2.y - p2.x * p1.y;
			x += (p1.x + p2.x) * f;
			y += (p1.y + p2.y) * f;
		}

		f = GeoJsonUtils.area(polygon) * 6;
		return {
			'type': 'Point',
			'coordinates': [y / f, x / f]
		};
	}

	GeoJsonUtils.simplify = function (source, kink) { /* source[] array of geojson points */
		/* kink	in metres, kinks above this depth kept  */
		/* kink depth is the height of the triangle abc where a-b and b-c are two consecutive line segments */
		kink = kink || 20;
		source = source.map(function (o) {
			return {
				lng: o.coordinates[0],
				lat: o.coordinates[1]
			}
		});

		var n_source, n_stack, n_dest, start, end, i, sig;
		var dev_sqr, max_dev_sqr, band_sqr;
		var x12, y12, d12, x13, y13, d13, x23, y23, d23;
		var F = (Math.PI / 180.0) * 0.5;
		var index = new Array(); /* aray of indexes of source points to include in the reduced line */
		var sig_start = new Array(); /* indices of start & end of working section */
		var sig_end = new Array();

		/* check for simple cases */

		if (source.length < 3) return (source); /* one or two points */

		/* more complex case. initialize stack */

		n_source = source.length;
		band_sqr = kink * 360.0 / (2.0 * Math.PI * 6378137.0); /* Now in degrees */
		band_sqr *= band_sqr;
		n_dest = 0;
		sig_start[0] = 0;
		sig_end[0] = n_source - 1;
		n_stack = 1;

		/* while the stack is not empty  ... */
		while (n_stack > 0) {
			/* ... pop the top-most entries off the stacks */
			start = sig_start[n_stack - 1];
			end = sig_end[n_stack - 1];
			n_stack--;

			if ((end - start) > 1) { /* any intermediate points ? */

				/* ... yes, so find most deviant intermediate point to
either side of line joining start & end points */

				x12 = (source[end].lng() - source[start].lng());
				y12 = (source[end].lat() - source[start].lat());
				if (Math.abs(x12) > 180.0) x12 = 360.0 - Math.abs(x12);
				x12 *= Math.cos(F * (source[end].lat() + source[start].lat())); /* use avg lat to reduce lng */
				d12 = (x12 * x12) + (y12 * y12);

				for (i = start + 1, sig = start, max_dev_sqr = -1.0; i < end; i++) {

					x13 = source[i].lng() - source[start].lng();
					y13 = source[i].lat() - source[start].lat();
					if (Math.abs(x13) > 180.0) x13 = 360.0 - Math.abs(x13);
					x13 *= Math.cos(F * (source[i].lat() + source[start].lat()));
					d13 = (x13 * x13) + (y13 * y13);

					x23 = source[i].lng() - source[end].lng();
					y23 = source[i].lat() - source[end].lat();
					if (Math.abs(x23) > 180.0) x23 = 360.0 - Math.abs(x23);
					x23 *= Math.cos(F * (source[i].lat() + source[end].lat()));
					d23 = (x23 * x23) + (y23 * y23);

					if (d13 >= (d12 + d23)) dev_sqr = d23;
					else if (d23 >= (d12 + d13)) dev_sqr = d13;
					else dev_sqr = (x13 * y12 - y13 * x12) * (x13 * y12 - y13 * x12) / d12; // solve triangle
					if (dev_sqr > max_dev_sqr) {
						sig = i;
						max_dev_sqr = dev_sqr;
					}
				}

				if (max_dev_sqr < band_sqr) { /* is there a sig. intermediate point ? */
					/* ... no, so transfer current start point */
					index[n_dest] = start;
					n_dest++;
				} else { /* ... yes, so push two sub-sections on stack for further processing */
					n_stack++;
					sig_start[n_stack - 1] = sig;
					sig_end[n_stack - 1] = end;
					n_stack++;
					sig_start[n_stack - 1] = start;
					sig_end[n_stack - 1] = sig;
				}
			} else { /* ... no intermediate points, so transfer current start point */
				index[n_dest] = start;
				n_dest++;
			}
		}

		/* transfer last point */
		index[n_dest] = n_source - 1;
		n_dest++;

		/* make return array */
		var r = new Array();
		for (var i = 0; i < n_dest; i++)
			r.push(source[index[i]]);

		return r.map(function (o) {
			return {
				type: "Point",
				coordinates: [o.lng, o.lat]
			}
		});
	}

	// http://www.movable-type.co.uk/scripts/latlong.html#destPoint
	GeoJsonUtils.destinationPoint = function (pt, brng, dist) {
		dist = dist/6371;  // convert dist to angular distance in radians
		brng = GeoJsonUtils.toRad(brng);

		var lon1 = GeoJsonUtils.toRad(pt.coordinates[0]);
		var lat1 = GeoJsonUtils.toRad(pt.coordinates[1]);

		var lat2 = Math.asin( Math.sin(lat1)*Math.cos(dist) +
							 Math.cos(lat1)*Math.sin(dist)*Math.cos(brng) );
		var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(dist)*Math.cos(lat1),
									 Math.cos(dist)-Math.sin(lat1)*Math.sin(lat2));
		lon2 = (lon2+3*Math.PI) % (2*Math.PI) - Math.PI;  // normalise to -180..+180º

		return {
			'type': 'Point',
			'coordinates': [GeoJsonUtils.toDeg(lon2), GeoJsonUtils.toDeg(lat2)]
		};
	}

	/** 
	 * Vincenty Direct Solution of Geodesics on the Ellipsoid (c) Chris Veness 2005-2012       
	 *                                                                                             
	 * from: Vincenty direct formula - T Vincenty, "Direct and Inverse Solutions 
	 * of Geodesics on the Ellipsoid with application of nested equations", 
	 * Survey Review, vol XXII no 176, 1975
	 *       http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf                                            
	 **/

	/**
	 * Calculates distance between two coordinates
	 * using Vincenty inverse formula for ellipsoids
	 *
	 * @param   {Number} lat1, lon1: first point
	 * @param   {Number} lat2, lon2: second point
	 * @param   {Function} [callback] to invoke after results calculated
	 * @returns {Number} distance in metres
	 **/
	GeoJsonUtils.distVincenty = function _distVincenty(lat1, lon1, lat2, lon2, callback) {
		var a = 6378137,
			b = 6356752.314245,
			f = 1 / 298.257223563;  // WGS-84 ellipsoid params

		var L = GeoJsonUtils.toRad(( lon2 - lon1 ));
		var U1 = Math.atan(( 1 - f ) * Math.tan( GeoJsonUtils.toRad(lat1) ));
		var U2 = Math.atan(( 1 - f ) * Math.tan( GeoJsonUtils.toRad(lat2) ));
		var sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
		var sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

		var lambda = L, lambdaP, iterLimit = 100;
		do {
			var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
			var sinSigma = Math.sqrt((cosU2*sinLambda) * (cosU2*sinLambda) +
									 (cosU1*sinU2-sinU1*cosU2*cosLambda) * (cosU1*sinU2-sinU1*cosU2*cosLambda));
			if (sinSigma==0) {
				var result = { 
					distance: 0, 
					initialBearing: 0, 
					finalBearing: 0 
				};
				if (callback !== undefined && callback instanceof Function) {
					if (callback.length === 3) {
						callback(result.distance, result.initialBearing, result.finalBearing);
					}
					else {
						callback(result.distance);
					}
				}
				return result;
			};  // co-incident points
			var cosSigma = sinU1*sinU2 + cosU1*cosU2*cosLambda;
			var sigma = Math.atan2(sinSigma, cosSigma);
			var sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
			var cosSqAlpha = 1 - sinAlpha*sinAlpha;
			var cos2SigmaM = cosSigma - 2*sinU1*sinU2/cosSqAlpha;
			if (isNaN(cos2SigmaM)) cos2SigmaM = 0;  // equatorial line: cosSqAlpha=0 (§6)
			var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));
			lambdaP = lambda;
			lambda = L + (1-C) * f * sinAlpha *
				(sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));
		} while (Math.abs(lambda-lambdaP) > 1e-12 && --iterLimit>0);

		if (iterLimit==0) return NaN  // formula failed to converge

		var uSq = cosSqAlpha * (a*a - b*b) / (b*b);
		var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
		var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
		var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
													 B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
		var s = b*A*(sigma-deltaSigma);

		s = Number(s.toFixed(3)); // round to 1mm precision

		// note: to return initial/final bearings in addition to distance, use something like:
		var fwdAz = Math.atan2(cosU2*sinLambda,  cosU1*sinU2-sinU1*cosU2*cosLambda);
		var revAz = Math.atan2(cosU1*sinLambda, -sinU1*cosU2+cosU1*sinU2*cosLambda);
		var result = { 
			distance: s, 
			initialBearing: GeoJsonUtils.toDeg(fwdAz), 
			finalBearing: GeoJsonUtils.toDeg(revAz) 
		};

		if (callback !== undefined && callback instanceof Function) {
			if (callback.length === 3) {
				callback(result.distance, result.initialBearing, result.finalBearing);
			}
			else {
				callback(result.distance);
			}
		}

		return result;
	}

	/**
	 * Calculates destination point given start point lat/long, bearing & distance,
	 * using Vincenty inverse formula for ellipsoids
	 *
	 * @param   {Number} lat1, lon1: first point in decimal degrees
	 * @param   {Number} brng: initial bearing in decimal degrees
	 * @param   {Number} dist: distance along bearing in metres
	 * @param   {Function} [callback] to invoke after results calculated
	 * @returns (LatLon} destination point
	 */
	GeoJsonUtils.destVincenty = function _destVincenty(lat1, lon1, brng, dist, callback) {
		var a = 6378137, b = 6356752.3142,  f = 1/298.257223563;  // WGS-84 ellipsiod
		var s = dist;
		var alpha1 = GeoJsonUtils.toRad(brng);
		var sinAlpha1 = Math.sin(alpha1);
		var cosAlpha1 = Math.cos(alpha1);

		var tanU1 = (1-f) * Math.tan(GeoJsonUtils.toRad(lat1));
		var cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1*cosU1;
		var sigma1 = Math.atan2(tanU1, cosAlpha1);
		var sinAlpha = cosU1 * sinAlpha1;
		var cosSqAlpha = 1 - sinAlpha*sinAlpha;
		var uSq = cosSqAlpha * (a*a - b*b) / (b*b);
		var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
		var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));

		var sigma = s / (b*A), sigmaP = 2*Math.PI;
		while (Math.abs(sigma-sigmaP) > 1e-12) {
			var cos2SigmaM = Math.cos(2*sigma1 + sigma);
			var sinSigma = Math.sin(sigma);
			var cosSigma = Math.cos(sigma);
			var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
														 B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
			sigmaP = sigma;
			sigma = s / (b*A) + deltaSigma;
		}

		var tmp = sinU1*sinSigma - cosU1*cosSigma*cosAlpha1;
		var lat2 = Math.atan2(sinU1*cosSigma + cosU1*sinSigma*cosAlpha1,
							  (1-f)*Math.sqrt(sinAlpha*sinAlpha + tmp*tmp));
		var lambda = Math.atan2(sinSigma*sinAlpha1, cosU1*cosSigma - sinU1*sinSigma*cosAlpha1);
		var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));
		var L = lambda - (1-C) * f * sinAlpha *
			(sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));
		var lon2 = (GeoJsonUtils.toRad(lon1)+L+3*Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180...+180

		var revAz = Math.atan2(sinAlpha, -tmp);  // final bearing, if required

		var result = { 
			lat: GeoJsonUtils.toDeg(lat2), 
			lon: GeoJsonUtils.toDeg(lon2), 
			finalBearing: GeoJsonUtils.GeoJsonUtils.toDeg(revAz) 
		};

		if (callback !== undefined && callback instanceof Function) {
			if (callback.length === 3) {
				callback(result.lat, result.lon, result.finalBearing);
			}
			else {
				callback(result);
			}
		}

		return result;
	}
})();
