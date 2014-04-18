Template.regattaUpdate.events({
	'submit form': function(e, template) {
		e.preventDefault();
		var name = template.find('#name').value;
		var startDate = new Date(template.find('#startDate').value);
		var endDate = new Date(template.find('#endDate').value);
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
		Alerts.add("Regatta "+name+" changed",'info',{ fadeIn: 200, fadeOut: 200, autoHide: 3000 });

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
		Alerts.add("Regatta "+name+" deleted",'info',{ fadeIn: 200, fadeOut: 200, autoHide: 3000 });
		}
	},
	
	'change .fileUpload': function(event) {
		console.log("fileUpload event: "+event.type);
		event.stopPropagation();
		event.preventDefault();
		var regattaId = UserSession.get('regattaId');
		var eventDateString = document.getElementById('eventDate').value;
		if (!eventDateString) {
			alert('Please enter an event date');
			return;
		}
		var eventDate = new Date(eventDateString);

		var files = event.target.files || event.dataTransfer.files || template.find('#files');

		for (var i = 0, file; file = files[i]; i++) {
			var type = file.type;
			var fileName = file.name;
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

			if (type.indexOf("csv") > -1) {
				var reader = new FileReader();
				reader.onloadend = function(e) {
					alert("finished loading");
					// process results - reader.result.substring(1,100) );
				};
				reader.readAsText(event.target.files[0]);
			} else
				if (fileName.match(/^.*\.evt$/)) {
					var reader = new FileReader();

					// wait until the entire file has been loaded into a String
					reader.onloadend = function _evtFileReaderOnLoadEnd (e) {

						// split the String into an array of lines
						var data = reader.result;
						var lines = data.split(/\r*\n/);

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
									Alerts.add('rowingEventsUpsert _id: "'+rowingEventId+'" failed, .evt file upload aborted!','error');
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
										Alerts.add('teams insert _id: "'+teamId+'"" failed, .evt file upload aborted!','error');
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
							};
							var race = Races.findOne(selector);
							if (race) {
								Races.update(selector,{$set: data});
							} else {
								data._id = raceId;
								Races.insert(data);
							}
							race = Races.findOne(selector);

							if (!race) {
								Alerts.add('racesUpsert failed, '+fileName+' file upload aborted!','error');
								return;
							}
						}
						Alerts.add(fileName + " events file loaded, "+lines.length+" lines",'info');
					}; // end of function reader.onloadend

					reader.readAsText(event.target.files[0]);
					return;
				}
			Alerts.add(fileName + " is wrong type, cannot load",'warning');
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

