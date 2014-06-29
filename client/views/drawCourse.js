// globals
var drawRacecourseMap;
var markers;
var polyline;
var venue;
var mode = 'FINISH';

function validateForm(event,template) {
	UserSession.set("error",undefined);
	var laneWidth = template.find('#laneWidth').value.trim();
	if (!laneWidth) {
		UserSession.set("error",'lane width required');
		return false;
	}
	var element = template.find('#element').value.trim();
	if (!element) {
		UserSession.set("error",'element required');
		return false;
	}
	var raceLength = template.find('#raceLength').value.trim();
	if (!raceLength) {
		UserSession.set("error",'race length required');
		return false;
	}
	return true
};

Template.drawCourse.events({
	'change #element': function _TemplateDrawCourseEventChangeElement(evt) {
		var value = $(evt.target).val();
		mode = value;
		UserSession.set('raceCourseDrawingMode',mode);
		return validateForm(event,template);
	},
	'submit form': function(event,template) {
		return validateForm(event,template);
	},
	'change #name': function(event,template) {
		return validateForm(event,template);
	},
	'change #laneWidth': function(event,template) {
		return validateForm(event,template);
	},
	'change #raceLength': function(event,template) {
		return validateForm(event,template);
	}
});

Template.drawCourse.elements = function _TemplateDrawCourseElements() {
	return venue.courseElements;
}

Template.drawCourse.error = function () {
	return UserSession.get("error");
};

// map elements used in rendered Deps.autorun function
var icon = "<svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='10' height='10'><path stroke='red' stroke-width='1' fill='none' d='M 0,0 L 10,10 M 10,0 L 0,10 Z'/></svg>";
var svgURL = "data:image/svg+xml;base64," + btoa(icon);
// create a special icon
var markerIcon = L.icon( {
	iconUrl: svgURL,
	iconSize: [10, 10],
	iconAnchor: [5, 5],
	popupAnchor: [5, -10]
} );

Template.drawCourse.rendered = function () {
	console.log("Template.drawCourse.rendered");
	markers = new Array();
	venue = this.data;
	UserSession.set('raceCourseDrawingMode',mode);

	// mapping 
	Deps.autorun(function() {
		if (!venue) return;

		console.log("venue: "+venue._id+","+venue.latitude+","+venue.longitude);

		// leaflet.js setup
		L.Icon.Default.imagePath = 'packages/leaflet/images';
		var Thunderforest_Landscape = L.tileLayer('http://{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png', {
			minZoom: 1,
			maxZoom: 100,
			attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
		});

		drawRacecourseMap = L.map('drawRacecourseMap').setView([venue.latitude, venue.longitude], 16);

		drawRacecourseMap.on('click',function(e) {
			if (UserSession.get('error')) return;

			switch(mode) {
				case 'FINISH':
					if (markers.length == 2) return;
					break;

				case 'START':
					if (markers.length == 2) return;
					break;

				case 'COURSE':
					break;
			}

			var latlng = e.latlng;
			var marker = L.marker(latlng, {id: markers.length, icon: markerIcon, draggable: 'true'} );
			marker.bindPopup(latlng.lat + ', ' + latlng.lng);
			marker.addTo(drawRacecourseMap);
			drawRacecourseMap.addLayer(marker);

			markers.push(marker);

			if (markers.length > 1) {
				if (markers.length == 2) {
					var line = new Array();
					for (var i=0; i<markers.length; i++) {
						line.push(markers[i].getLatLng());
					}
					polyline = L.polyline(line, {color: 'red'});
					drawRacecourseMap.addLayer(polyline);
				} else {
					polyline.addLatLng(latlng);
				}
			}

			marker.on('dragend', function(event){
				var marker = event.target;
				var latlng = marker.getLatLng();
				marker.bindPopup(latlng);
				marker.update();

				if (markers.length > 1) {
					var line = [];
					for (var i=0; i<markers.length; i++) {
						line.push(markers[i].getLatLng());
					}
					polyline.setLatLngs(line);
				}
			});
		});
		
		drawRacecourseMap.addLayer(Thunderforest_Landscape);
		L.control.mousePosition().addTo(drawRacecourseMap);
		console.log("drawRacecourseMap created");
	});
}

