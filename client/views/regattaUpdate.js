Template.regattaUpdate.events({
	'submit form': function(e) {
		e.preventDefault();
		var regattaId = UserSession.get('regattaId');
		var regattaProperties = {
			venueId: $(e.target).find('[name=venueList]').val(),
			startDate: $(e.target).find('[name=startDate]').val(),
			livePrice: $(e.target).find('[name=livePrice]').val()
		}
		console.dir("regattaUpdate: " + regattaProperties);
		Regattas.update(regattaId, {$set: regattaProperties}, function(error) {
			if (error) {
				// display the error to the user
				alert(error.reason);
			} else {
				Router.go('/regattaEdit/'+regattaId);
			}
		});
	},
	'click .delete': function(e) {
		e.preventDefault();
		if (confirm("Delete this regatta?")) {
			var regattaId = UserSession.get('regattaId');
			Regattas.remove(regattaId);
			UserSession.remove('regattaId');
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

		var files = event.target.files || event.dataTransfer.files || document.getElementById('files');

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
							startsAt = parseTime(name[2]+name[3],eventDate);
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
								var data = {
									regattaId: regattaId,
									number: rowingEventNumber,
									name: eventName, 
									rowingEventStatus: 'pending', 
									sex: sex, 
									ages: ages, 
									weightType: weightType, 
									crewType: crewType
								};
								if (rowingEvent) {
									RowingEvents.update(selector, {$set: data});
								} else {
									data._id = rowingEventId;
									RowingEvents.insert(data);
								}

								rowingEvent = RowingEvents.findOne(selector);

								if (!rowingEvent) {
									alert('rowingEventsUpsert _id: "'+rowingEventId+'" failed, .evt file upload aborted!');
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
										alert('teams insert _id: "'+teamId+'"" failed, .evt file upload aborted!');
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
								alert('racesUpsert failed, '+fileName+' file upload aborted!');
								return;
							}
						}
						alert(fileName + " finished loading events\n"+lines.length+" lines");
					}; // end of function reader.onloadend

					reader.readAsText(event.target.files[0]);
					return;
				}
			alert(fileName + " is wrong type, cannot load")
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

