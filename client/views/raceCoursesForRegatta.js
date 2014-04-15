Template.raceCourseForRegatta.races = function _TemplateRaceCourseForRegattaRaces(races) {
	var sortedRaces = [];
	if (!races) {

		console.log('raceCoursesForRegatta no races found ');
		alert("no races are currently running");
		return "";
	} else {
		console.log('raceCoursesForRegatta');
		sortedRaces = races.sort();
	}	
	result = "";
	for (var i=0; i < sortedRaces.length ; i++) {
		raceNumber = races[i];
		console.log('generateRaces raceNumber:'+raceNumber);
		if (isNaN(raceNumber)) {
			btnColor = 9;
		} else {
			btnColor = raceNumber % 9;
		}
		race = Races.findOne({number: raceNumber});
		if (race !== undefined) {
			eventName = getEventName(race.rowingEventId);
			stageName = getStageName(race.stageType,race.stageNumber);
			result += '<span class="boat button btn btn-sm btn-'+btnColor+'">Race '+raceNumber+' '+eventName+'-'+stageName+'</span> ';
		}
	}
	return result;
}

Template.raceCourseForRegatta.lanes = function _TemplateRaceCourseForRegattaLanes(lanes, markers) {
	console.log('generateLines ');
	result = "";
	console.log('generateLines lanes.length:'+lanes.length);
	for (var lane=0; lane < lanes.length ; lane++) {
		console.log('generateLines lane:'+lanes[lane].number);
		result += '<tr><td>' + lanes[lane].number + '</td>';
		markerArray = [];
		for (var crewIndex=0 ; crewIndex < lanes[lane].crews.length ; crewIndex++) {
			crew = lanes[lane].crews[crewIndex];
			console.log('generateLines crew bow:'+crew.bow+" lastMarker:"+crew.lastMarker);

			if (crew.lastMarker)
				marker = _.indexOf(markers,crew.lastMarker)+1;
			else
				marker = 0;

			if (markerArray[marker] === undefined) {
				markerArray[marker] = new Array();
			}
			markerArray[marker].push(crew);
		}
		for (var marker=0; marker < markerArray.length ; marker++) {
			result += '<td>';
			markerCrews = markerArray[marker];
			for (var crew=0 ; crew < markerCrews.length ; crew++) {
				race = markerCrews[crew].race;

				if (isNaN(race)) {
					bowColor = 9;
				} else {
					bowColor = race % 9;
				}

				console.log('generateLines crew bow:'+crew.bow+" bowColor:"+bowColor);
				result += '<span class="boat button btn btn-sm btn-boat btn-'+bowColor+'" title="'+markerCrews[crew].name+'">'+markerCrews[crew].bow+'</span> ';
			}
			result += '</td>';
		}
		result += '</tr>\n';
	}
	return result;
}

