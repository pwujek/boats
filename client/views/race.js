
Template.race.placeName = function _TemplateRacePlaceName(value) { 
	var placeNames = ["",
					  "1st","2nd","3rd","4th","5th","6th","7th","8th","9th",
					  "10th","11st","12nd","13rd","14th","15th","16th","17th","8th","19th",
					  "20th","21st","22nd","23rd","24th","25th","26th","27th","28th","29th",
					  "30th","31st","32nd","33rd","34th","35th","36th","37th","38th","39th"];

	return value ? placeNames[value] + " - ": "";
}

Template.race.whenExists = function _TemplateRaceWhenExists(name,value) { 
	return value ? name + ":" + value + " ": "";
}

Template.race.whenExistsPct = function _TemplateRaceWhenExistsPct(value) { 
	return value ? value + "% ": "";
}

Template.race.crewsByRaceId = function _TemplateRaceCrewsByRaceId(raceId) {
	return Crews.find({raceId: raceId}, {sort: {place: 1, bow: 1}});
}

