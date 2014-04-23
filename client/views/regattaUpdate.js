parseValueInMap = function (value, map) {
	var result;
	for (var key in map) {
		if (value.indexOf(key) > -1) {
			result = map[key];
			break;
		}
	}
	return result;
}

parseBoatClass = function _parseBoatClass(value) {
	var map = {
		"1X": "1X",
		"single": "1X",
		"single skull": "1X",
		"2+": "2+",
		"coxed pair": "2+",
		"2-": "2-",
		"pair": "2-",
		"2X": "2X",
		"double": "2X",
		"double skull": "2X",
		"4+": "4+",
		"coxed four": "4+",
		"coxed 4": "4+",
		"4-": "4-",
		"4X": "4X",
		"quadruple skull": "4X",
		"quadruple": "4X",
		"quad": "4X",
		"8+": "8+",
		"eight": "8+",
		"8X": "8X"
	};
	return parseValueInMap(value,map);
}

parseSex = function _parseSex(value) {
	var map = {
		" mens": "Mens",
		" men's": "Mens",
		"womens": "Womens",
		"women's": "Womens",
		"boys": "Boys",
		"girls": "Girls",
		"mix": "Mixed"
	};
	return parseValueInMap(value,map);
}

parseWeight = function _parseWeight(value) {
	var map = {
		"ltwt": "Ltwt",
		"hwt": "Hwt",

		// para classes
		" lta ": "LTA",
		" as ": "AS",
		" ta ": "TA",
		" id ": "ID"
	}
	return parseValueInMap(value,map);
}

parseAge = function _parseAge(value) {
	var map = {
		"masters": "Masters",
		"youth": "Youth",
		"juvenile": "JV",
		"jv": "JV",
		"junior": "JR",
		"jr": "JR",
		"sr": "SR",
		"novice": "JR",
		"varsity": "JR",
		"intermediate": "Intermediate",
		"senior": "SR",
		"elite": "Elite",
		"fr": "???",
		"juvenile": "JV"
	}
	return parseValueInMap(value,map);
}

parseStageType = function _parseStageType(value) {
	var map = {
		"heat": "Heat",
		"final": "Final",
		"flight": "Flight"
	}
	return parseValueInMap(value,map);
}

parseStageNumber = function _parseStageNumber(value) {
	var tokens = value.split(' ');
	var lastToken = tokens[tokens.length - 1];
	if (isNaN(lastToken)) 
		return;
	else
		return lastToken;
}

parseEventName = function _parseEventName(value,stageType) {
	var end = value.indexOf(stageType) - 1;
	var result = value.substring(0,end);
	return result;
}

parseRaceName = function _parseEventName(value) {
	var begin = value.search(/( AM | PM )/) + 4;
	var result = value.substring(begin);
	return result;
}

var eventDate;
var files = [];

evtFileUpdate = function () {
	var race;
	var raceNumber;
	var rowingEvent;
	var rowingEventId;
	var rowingEventNumber;
	var crew;
	var team;
	var stageType;
	var raceName;
	var eventName;
	var ages;
	var crewType;
	var sex;
	var startsAt;
	var weightType;
	var stageNumber;
	// split the String into an array of lines
	var data = this.result;
	var lines = data.split(/\r*\n/);
	var regattaId = UserSession.get('regattaId');

	var $modal = $('.js-loading-bar'),
		$bar = $modal.find('.progress-bar');
	var progress = 0;

	if (files.length == 1) {
		$('#fileUploadProgress').attr('aria-valuenow',progress);
		$('#fileUploadProgress').css('width','' + progress + '%');
		$('#fileUploadProgress').text(progress + '% complete');

		$('.js-loading-bar').modal({
			backdrop: 'static',
			show: false
		});

		$modal.modal('show');
		$bar.addClass('animate');
	}

	// process the lines
	var lineIndex = 0;
	while (lineIndex < lines.length) {
		if (files.length == 1) {
			progress = (((lineIndex+1)/lines.length) * 100).toFixed(0);
			$('#fileUploadProgress').attr('aria-valuenow',progress);
			$('#fileUploadProgress').css('width','' + progress + '%');
			$('#fileUploadProgress').text(progress + '% complete');
			console.log("progress "+progress);
		}
		var line = lines[lineIndex];

		if (!line) break;

		var tokens = line.split(/,/);
		var newRowingEvent = (rowingEventNumber != tokens[0]);
		rowingEventNumber = tokens[0].trim();
		stageType = tokens[1].trim();
		raceNumber = tokens[2].trim();
		var name = tokens[3].split(/ /);
		startsAt = parseTime(name[2] + name[3], eventDate);
		
		var lowerCaseName = tokens[3].toLowerCase();

		crewType = parseBoatClass(lowerCaseName);
		weightType = parseWeight(lowerCaseName);
		ages = parseAge(lowerCaseName);
		sex = parseSex(lowerCaseName);
		stageType = parseStageType(stageType);
		stageNumber = parseStageNumber(lowerCaseName)
		raceName = parseRaceName(tokens[3]);
		eventName = parseEventName(raceName,stageType);

		if (newRowingEvent) {
			rowingEventId = regatta.name.replace(/\s/g,'_') + '-' + rowingEventNumber;

			var selector = {_id: rowingEventId};
			console.log('rowingEventsUpsert id: "'+rowingEventId+'"');
			rowingEvent = RowingEvents.findOne(selector);
			// startsAt is added here to aid sorting
			var data = {
				regattaId: regattaId,
				number: rowingEventNumber,
				name: eventName, 
				rowingEventStatus: 'pending', 
				sex: sex, 
				ages: ages, 
				weightType: weightType, 
				crewType: crewType,
				startsAt: startsAt
			};
			if (rowingEvent) {
				RowingEvents.update(selector, {$set: data});
			} else {
				data._id = rowingEventId;
				RowingEvents.insert(data);
			}

			rowingEvent = RowingEvents.findOne(selector);

			if (!rowingEvent) {
				alert('rowingEventsUpsert _id: "'+rowingEventId+'" failed, .evt file upload aborted at line '+lineIndex+"<br>"+line);
				$bar.removeClass('animate');
				$modal.modal('hide');
				return;
			}
		}

		// process crew data
		var crews = [];

		while (true) { 
			++lineIndex;
			if (lineIndex >= lines.length) break; // finished reading data

			var raceLine = lines[lineIndex];
			if (!raceLine) break; // finished reading data

			elements = raceLine.split(/,/); 

			if (elements[0]) break; // next RowingEvent

			var bowNumber = elements[2].trim();
			var lastName = elements[3].trim();
			var firstName = elements[4].trim();
			var crewName = elements[5].trim().replace(/\/null/g,'');
			var teamName = crewName.substring(0, crewName.lastIndexOf('(') - 1).trim().replace(/ [A-Z]$/,'');
			crews.push({
				bowNumber: bowNumber,
				name: crewName,
				team: teamName
			});

			// if a new team create it or add boat
			var teamAbbrev = teamName.replace(/\/|\s/g,'_');
			var teamId = regattaId + '-' + teamAbbrev;
			selector = {regattaId: regattaId, name: teamName};
			var team = Teams.findOne(selector);
			var boatIsNew = true;
			var boats = [];
			if (team) {
				if (team.boats) {
					boats = team.boats;
					for (var i=0; i < boats.length ; i++) {
						if (boats[i] == crewName) {
							boatIsNew = false;
							break;
						}
					}
				}
			}

			if (team && boatIsNew) {
				boats.push(crewName);
				Teams.update({_id: teamId} ,{$set: {boats: boats.sort()}});
			} else if (!team) {
				console.log('teams Insert _id:' + teamId);
				if (boats.length == 0) boats.push(crewName);
				Teams.insert({
					_id: teamId,
					regattaId: regattaId,
					abbrev: teamAbbrev,
					name: teamName,
					shortName: teamName,
					boats: boats.sort()
				});
				team = Teams.findOne(selector);
				if (!team) {
					alert('teams insert _id: "'+teamId+'"" failed, .evt file upload aborted at line '+lineIndex+"<br>"+line);
					$bar.removeClass('animate');
					$modal.modal('hide');
					return;
				}
			}
		}

		raceNumber = tokens[2];
		raceId = rowingEventId + '-' + raceNumber;
		var selector = {_id: raceId};
		console.log('racesUpsert _id: "' + raceId + '"');
		var data = {
			regattaId: regattaId,
			rowingEventId: rowingEventId, 
			number: raceNumber,
			name: raceName, 
			startsAt: startsAt,
			startMarker: null,
			stageType: stageType,
			stageNumber: stageNumber,
			raceStatus: 'pending',
			crews: crews
		}
		var race = Races.findOne(selector);
		if (race) {
			Races.update(selector,{$set: data});
		} else {
			data._id = raceId;
			Races.insert(data);
		}
		race = Races.findOne(selector);

		if (!race) {
			alert('racesUpsert failed, .evt file upload aborted at line '+lineIndex+"<br>"+line);
			$bar.removeClass('animate');
			$modal.modal('hide');
			return;
		}
	}
	
	if (files.length == 1) {
		setTimeout(function() {
			$bar.removeClass('animate');
			$modal.modal('hide');
		}, 3000);
	}
}

lifFileUpdate = function (file) {
	var race;
	var raceNumber;
	var rowingEvent;
	var rowingEventId;
	var rowingEventNumber;
	var crew;
	var team;
	var stageType;
	var raceName;
	var eventName;
	var ages;
	var crewType;
	var sex;
	var startsAt;
	var weightType;
	var stageNumber;
	// split the String into an array of lines
	var data = this.result;
	var regattaId = UserSession.get('regattaId');
	var lines = data.split(/\r*\n/);
	console.log("lines "+lines.length);

	// process the lines
	var lineIndex = 0;
	while (lineIndex < lines.length) {
		var line = lines[lineIndex];

		if (!line) break;

		var tokens = line.split(/,/);
		var newRowingEvent = (rowingEventNumber != tokens[0]);
		rowingEventNumber = tokens[0].trim();
		stageType = tokens[1].trim();
		raceNumber = tokens[2].trim();
		var name = tokens[3].split(/ /);
		startsAt = parseTime(name[2] + name[3], eventDate);
		sex = name[4].trim();
		var startedAt = tokens[10];
		
		var lowerCaseName = tokens[3].toLowerCase();

		crewType = parseBoatClass(lowerCaseName);
		weightType = parseWeight(lowerCaseName);
		ages = parseAge(lowerCaseName);
		sex = parseSex(lowerCaseName);
		stageType = parseStageType(stageType);
		stageNumber = parseStageNumber(lowerCaseName)
		raceName = parseRaceName(tokens[3]);
		eventName = parseEventName(raceName,stageType);

		if (newRowingEvent) {
			rowingEventId = regatta.name.replace(/\s/g,'_') + '-' + rowingEventNumber;

			var selector = {_id: rowingEventId};
			console.log('rowingEventsUpsert id: "'+rowingEventId+'"');
			rowingEvent = RowingEvents.findOne(selector);
			// startsAt is added here to aid sorting
			var data = {
				regattaId: regattaId,
				number: rowingEventNumber,
				name: eventName, 
				rowingEventStatus: 'pending', 
				sex: sex, 
				ages: ages, 
				weightType: weightType, 
				crewType: crewType,
				startsAt: startsAt
			};
			if (rowingEvent) {
				RowingEvents.update(selector, {$set: data});
			} else {
				data._id = rowingEventId;
				RowingEvents.insert(data);
			}

			rowingEvent = RowingEvents.findOne(selector);

			if (!rowingEvent) {
				alert('rowingEventsUpsert _id: "'+rowingEventId+'" failed, .lif file upload aborted at line '+lineIndex+"<br>"+line);
				return;
			}
		}

		// process crew data
		raceId = rowingEventId + '-' + raceNumber;
		console.log('racesUpsert _id: "' + raceId + '"');
		var selector = {_id: raceId};
		var race = Races.findOne(selector);
		var crews = race ? race.crews : [];

		while (true) { 
			++lineIndex;
			if (lineIndex >= lines.length) break; // finished reading data

			var raceLine = lines[lineIndex];
			if (!raceLine) break; // finished reading data

			elements = raceLine.split(/,/); 

			if (elements[1]) break; // next RowingEvent

			var place = elements[0].trim();
			var bowNumber = elements[2].trim();
			var lastName = elements[3].trim();
			var firstName = elements[4].trim();
			var crewName = elements[5].trim().replace(/\/null/g,'');
			var teamName = crewName.substring(0, crewName.lastIndexOf('(') - 1).trim().replace(/ [A-Z]$/,'');
			if (crewName.length > 30) {
				crewName = teamName + ' (' + firstName.charAt(0) + '. ' + lastName + ')';
			}
			var netTime = elements[6].trim();
			var split = elements[8].trim();
			if (split === netTime) split = 0;

			var crew = {
				bowNumber: bowNumber,
				place: place,
				name: crewName,
				team: teamName,
				startedAt: startedAt,
				netTime: netTime,
				split: split
			};

			var crewFound = false;
			for (var i=0; i < crews.length ; i++) {
				if (crews[i].name === crewName) {
					crewFound = true;
					crews[i] = crew;
				}
			}
			
			if (!crewFound) {
				crews[crews.length] = crew;
			}

			// if a new team create it or add boat
			var teamAbbrev = teamName.replace(/\/|\s/g,'_');
			var teamId = regattaId + '-' + teamAbbrev;
			selector = {regattaId: regattaId, name: teamName};
			var team = Teams.findOne(selector);
			var boatIsNew = true;
			var boats = [];
			if (team) {
				if (team.boats) {
					boats = team.boats;
					for (var i=0; i < boats.length ; i++) {
						if (boats[i] == crewName) {
							boatIsNew = false;
							break;
						}
					}
				}
			}

			if (team && boatIsNew) {
				boats.push(crewName);
				Teams.update({_id: teamId} ,{$set: {boats: boats.sort()}});
			} else if (!team) {
				console.log('teams Insert _id:' + teamId);
				if (boats.length == 0) boats.push(crewName);
				Teams.insert({
					_id: teamId,
					regattaId: regattaId,
					abbrev: teamAbbrev,
					name: teamName,
					shortName: teamName,
					boats: boats.sort()
				});
				team = Teams.findOne(selector);
				if (!team) {
					alert('teams insert _id: "'+teamId+'"" failed, .lif file upload aborted at line '+lineIndex+"<br>"+line);
					return;
				}
			}
		}

		var data = {
			regattaId: regattaId,
			rowingEventId: rowingEventId, 
			number: raceNumber,
			name: raceName, 
			startsAt: startsAt,
			startMarker: null,
			stageType: stageType,
			stageNumber: stageNumber,
			raceStatus: 'finished',
			crews: crews
		}
		
		if (race) {
			var selector = {_id: raceId};
			Races.update(selector,{$set: data});
		} else {
			data._id = raceId;
			Races.insert(data);
		}
		
		race = Races.findOne(selector);

		if (!race) {
			alert('racesUpsert failed, .lif file upload aborted at line '+lineIndex+"<br>"+line);
			return;
		}
	}
}

Template.regattaUpdate.events({
	'submit form': function(e, template) {
		e.preventDefault();
		var name = template.find('#name').value;
		var startDate = Date.parseDate(template.find('#startDate').value,'d/m/Y');
		var endDate = Date.parseDate(template.find('#endDate').value,'d/m/Y');
		eventDate = Date.parseDate(template.find('#eventDate').value,'d/m/Y');
		var livePrice = template.find('#livePrice').value;
		var venueList = template.find('#venueList');
		var venueId = venueList.options[venueList.selectedIndex].value;
		var changes = {
			name: name, 
			venueId: venueId, 
			livePrice: livePrice, 
			startDate: startDate, 
			endDate: endDate
		};
		var regattaId = Regattas.update({_id: regattaId},{$set: changes});
		alert(name + ' updated');
	},

	'click .delete': function(e, template) {
		e.preventDefault();
		var name = template.find('#name').value;
		var response = confirm("Do you want to delete Regatta: '"+name + "'?");
		if (response == true) {
			var positions = Positions.find({regattaId: this._id}).fetch();
			positions.forEach(function(v){Positions.remove(v._id);}); 
			var races = Races.find({regattaId: this._id}).fetch();
			races.forEach(function(v){Races.remove(v._id);}); 
			var raceCourses = RaceCourses.find({_id: this._id}).fetch();
			raceCourses.forEach(function(v){RaceCourses.remove(v._id);}); 
			var rowingEvents = RowingEvents.find({regattaId: this._id}).fetch();
			rowingEvents.forEach(function(v){RowingEvents.remove(v._id);}); 
			var timeRecords = TimeRecords.find({regattaId: this._id}).fetch();
			timeRecords.forEach(function(v){TimeRecords.remove(v._id);}); 
			Regattas.remove(this._id);
			alert("Regatta '" + name + "'' deleted");
			if (UserSession.get('regattaId') && UserSession.get('regattaId') === this._id) {
				UserSession.delete('regattaId');
				UserSession.delete('regatta');
				regattaId = null;
				regatta = null;
				Router.go('/');
			} else {
				Router.go('/regattas');
			}
		}
	},

	'change .fileUpload': function(event) {
		console.log("fileUpload event: "+event.type);
		event.stopPropagation();
		event.preventDefault();
		var eventDateString = document.getElementById('eventDate').value;
		if (!eventDateString) {
			alert('Please enter an event date');
			return;
		}
		eventDate = Date.parseDate(eventDateString,'d/m/Y');

		files = event.target.files || event.dataTransfer.files || template.find('#files');

		var progress = 0;
		
		if (files.length > 1) {
			$('#fileUploadProgress').attr('aria-valuenow',progress);
			$('#fileUploadProgress').css('width','' + progress + '%');
			$('#fileUploadProgress').text(progress + '% complete');

			$('.js-loading-bar').modal({
				backdrop: 'static',
				show: false
			});

			var $modal = $('.js-loading-bar'),
				$bar = $modal.find('.progress-bar');

			$modal.modal('show');
			$bar.addClass('animate');
		}

		for (var i = 0, file; file = files[i]; i++) {
			var type = file.type;
			var fileName = file.name;
			console.log('loading '+fileName);
			var reader = new FileReader();

			var extension = fileName.substr(fileName.lastIndexOf('.')+1);

			switch (extension) {
				case 'evt':
					reader.onloadend = evtFileUpdate;
					break;
				case 'lif':
					reader.onloadend = lifFileUpdate;
					break;
				default:
					alert("File '" + fileName + "' is wrong type, cannot load");
					$('#fileUploadProgress').attr('visibility','hidden');
					return;
			}
			reader.readAsText(file);
			if (files.length > 1) {
				progress = (((i+1)/files.length) * 100).toFixed(1);
				$('#fileUploadProgress').attr('aria-valuenow',progress);
				$('#fileUploadProgress').css('width','' + progress + '%');
				$('#fileUploadProgress').text(progress + '% complete');
				console.log("progress "+progress);
			}
		}

		if (files.length > 1) {
			setTimeout(function() {
				$bar.removeClass('animate');
				$modal.modal('hide');
			}, 3000);
		}
	}
});

Template.regattaUpdate.venues = function() {
	return Venues.find({},{sort: {name: 1}}).fetch();
}

Template.regattaUpdate.rendered=function() {
	//https://atmospherejs.com/package/bootstrap3-datepicker
	$('#startDate').datepicker();
}

Template.regattaUpdate.selected = function(one,two) {
	var selectedAttribute = '';
	if (one == two) {
		selectedAttribute = 'selected';
	}
	return selectedAttribute;
}
