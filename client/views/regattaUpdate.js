var reader = null;
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
var eventDate;
var ages;
var crewType;
var sex;
var startsAt;
var weightType;
var stageNumber;
var boatClasses = {
	"1X": true,
	"2+": true,
	"2-": true,
	"2X": true,
	"4+": true,
	"4-": true,
	"4X": true,
	"8+": true,
	"8X": true
}

evtFileUpdate = function () {
	// split the String into an array of lines
	var data = reader.result;
	var lines = data.split(/\r*\n/);
	var regattaId = UserSession.get('regattaId');

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

		if (name[5] == 'Ltwt' || name[5] == 'Hwt') {
			weightType = name[5];
			if (boatClasses[name[6]]) {
				ages = '';
				crewType = name[6];
				stageType = name[7];
				stageNumber = name[8];
			} else {
				ages = name[6];
				crewType = name[7];
				stageType = name[8] ? name[8] : '';
				stageNumber = name[9] ? name[9] : '';
			} 
		} else {
			weightType = '';
			if (boatClasses[name[5]]) {
				ages = '';
				crewType = name[5];
				stageType = name[6];
				stageNumber = name[7];
			} else {
				ages = name[5];
				crewType = name[6];
				stageType = name[7] ? name[7] + ' ' : '';
				stageNumber = name[8] ? name[8] + ' ' : '';
			} 
		}
		eventName = 
			(sex ? sex + ' ' : '')
		+ (weightType ? weightType + ' ' : '') 
		+ (ages ? ages + ' ' : '') 
		+ crewType;
		raceName = 
			raceNumber + ' '
		+ eventName + ' '
		+ (stageType ? stageType + ' ' : '') 
		+ (stageNumber ? stageNumber + ' ' : '');

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
			crews[crews.length] = {
				bowNumber: bowNumber,
				name: crewName,
				team: teamName
			};

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
			return;
		}
	}
}

lifFileUpdate = function (file) {
	// split the String into an array of lines
	var data = reader.result;
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

		if (name[5] == 'Ltwt' || name[5] == 'Hwt') {
			weightType = name[5];
			if (boatClasses[name[6]]) {
				ages = '';
				crewType = name[6];
				stageType = name[7];
				stageNumber = name[8];
			} else {
				ages = name[6];
				crewType = name[7];
				stageType = name[8] ? name[8] : '';
				stageNumber = name[9] ? name[9] : '';
			} 
		} else {
			weightType = '';
			if (boatClasses[name[5]]) {
				ages = '';
				crewType = name[5];
				stageType = name[6];
				stageNumber = name[7];
			} else {
				ages = name[5];
				crewType = name[6];
				stageType = name[7] ? name[7] + ' ' : '';
				stageNumber = name[8] ? name[8] + ' ' : '';
			} 
		}
		eventName = 
			(sex ? sex + ' ' : '')
		+ (weightType ? weightType + ' ' : '') 
		+ (ages ? ages + ' ' : '') 
		+ crewType;
		raceName = 
			raceNumber + ' '
		+ eventName + ' '
		+ (stageType ? stageType + ' ' : '') 
		+ (stageNumber ? stageNumber + ' ' : '');

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
		var crews = [];

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

			crews[crews.length] = {
				bowNumber: bowNumber,
				place: place,
				name: crewName,
				team: teamName,
				startedAt: startedAt,
				netTime: netTime,
				split: split
			};

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
			raceStatus: 'finished',
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
		var eventDate = Date.parseDate(template.find('#eventDate').value,'d/m/Y');
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
			if (UserSession.get('regattaId') == this._id) {
				UserSession.remove('regattaId');
				UserSession.remove('regatta');
				regattaId = null;
				regatta = null;
			}
			alert("Regatta '" + name + "'' deleted");
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

		var files = event.target.files || event.dataTransfer.files || template.find('#files');

		for (var i = 0, file; file = files[i]; i++) {
			var type = file.type;
			var fileName = file.name;
			console.log('loading '+fileName);
			reader = new FileReader();

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
					return;
			}
			reader.readAsText(file);
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
