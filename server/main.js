// server/main.js
// code run after every other file has been loaded
//
logger = TLog.getLogger(TLog.LOGLEVEL_MAX,true,true); 

if (Races.find().count() < 1) {
 var allRoles=[
  'admin',
  'manage-users',
  'spectator',
  'paid',
  'official',
  'competitor',
  'judge-at-start',
  '500-marker',
  '1000-marker',
  '1500-marker',
  '2000-marker',
  '2500-marker',
  '3000-marker',
  '3500-marker',
  'finish-line',
  'judge',
  'chief-judge',
  'referee',
  'chief-referee',
  'starter',
  'marshal',
  'timer',
  'clerk',
  'monitor',
  'update-venue',
  'update-regatta',
  'update-event',
  'update-race',
  'update-team',
  'update-competitor',
  'update-crew',
  'update-time',
  'team-admin',
  'regatta-director',
  'regatta-secretary'
 ];

 logger.info('create roles:'+allRoles.toString(),'main.js');

 _.each(allRoles, function(role) {
  try {
  Roles.createRole(role);
  } catch (ex) {
   return;
  }
 });

 var users = [
 {name:"PW",email:"paul.wujek@gmail.com",roles:['admin','admin-users','spectator','official','manage-users']},
 {name:"HWK",email:"bknapp@gmail.com",roles:['spectator','admin','official']},
 {name:"CG",email:"clete.graham@gmail.com",roles:['spectator','admin','official']},
 {name:"spectator",email:"norm@mail.com",roles:['spectator']},
 {name:"timer1",email:"o1@mail.com",roles:['spectator','official','start-line']},
 {name:"timer2",email:"o2@mail.com",roles:['spectator','official','500-marker','1000-marker','1500-marker','2000-marker','2500-marker','3000-marker','3500-marker','finish-line']},
 {name:"timer3",email:"o3@mail.com",roles:['spectator','official','finish-line']}
 ];

 _.each(users, function (user) {
  var id;
  logger.info('create user: '+user.name,'main.js');

  try {
   id = Accounts.createUser({
    email: user.email,
      password: "ok",
      profile: { name: user.name }
   });
  } catch (ex) {
   return;
  }

  if (user.roles.length > 0) {
   Roles.addUsersToRoles(id,user.roles);
  }

 }
 );

 logger.info('creating test data - Venues','main.js');

 var scuklVenueId = Venues.insert(new Venue('SCUKL','Schulykill','1 Crewhouse Row, Philadelphia, PA, US','-05',6,[3,4,2,1,5,6],['START','500','1000','1500','2000','2500','3000','3500','FINISH'],39.998657,-75.193784).toJSONValue() );

 var chrlsVenueId = Venues.insert(new Venue('CHRLS','Charles River','1225 Soldiers Field Road, Brighton, MA 02135','-05',8,[3,4,2,1,5,7,6,8], ['START','500','1000','1500','2000','2500','3000','3500','FINISH'], 42.365108, -71.135706).toJSONValue() );

 var testVenueId = Venues.insert(new Venue('TEST','Test Venue','1 Soldiers Field Road, Brighton, MA 02135','-05',8,[3,4,2,1,5,7,6,8], ['START','500','1000','1500','2000','2500','3000','3500','FINISH'], 42.365108, -71.135706).toJSONValue());

 logger.info('creating test data - Regattas','main.js');

 Regattas.insert(new Regatta('2013 Philadelphia Children\'s Foundation Regatta','SCUKL',0,[{date: new Date(2013,10,03),notices:[]}],new Date(2013,9,19)).toJSONValue());

 Regattas.insert(new Regatta('2013 Head of the Schulykill Regatta','SCUKL', 0,[],[ {date: new Date(2013,9,26),notices:[]}, {date: new Date(2013,9,27),notices:[]} ],new Date(2013,9,26)).toJSONValue());

 Regattas.insert(new Regatta('2013 Philadelphia Turn and Burn Regatta','SCUKL',0,[],[ {date: new Date(2013,10,3),notices:[]} ],new Date(2013,10,3)).toJSONValue());

 Regattas.insert(new Regatta('2013 Philadelphia Frostbite Regatta','SCUKL',0,[],[ {date: new Date(2013,10,9),notices:[]}],new Date(2013,10,9)).toJSONValue());

 navyDayRegattaId = Regattas.insert(new Regatta('2013 Navy Day Regatta','SKUKL',0,[],[ {date: new Date(2013,9,12),notices:[]} ],new Date(2013,9,12)).toJSONValue());

 logger.info('creating test data - RowingEvents and Races','main.js');
 stageType = 'Final'
 regattaId = navyDayRegattaId;

 ins = function(regattaId,number,name,startsAt,sex,ages,weightType,crewType) {
  len = arguments.length;
  if (len != 8) {
   if (console) {
    console.log('number: '+number+' name: '+name+' wrong number of arguments: '+len);
    return;
   }
  }
  rowingEventId = RowingEvents.insert(new RowingEvent(regattaId,name,'finished',sex,ages,weightType,crewType,[],[],[]).toJSONValue());
  Races.insert(new Race(regattaId,rowingEventId,number,startsAt,'final',3,'finished',[],[],[]).toJSONValue());
 }

 ins(regattaId,51,'Corp Challenge/Business Schools Mixed 4+',new Date(2013,9,02,10,00),'MIX',['JV'],'OPEN','4+');
 ins(regattaId,50,'Womens Masters 4+',new Date(2013,9,02,10,02),'WOMEN',['AA'],'OPEN','4+');
 ins(regattaId,1,'Mens Open 2',new Date(2013,9,02,10,03),'MEN',['AA'],'OPEN','2');
 ins(regattaId,2,'Mens HS 2x',new Date(2013,9,02,10,03),'MEN',['H'],'OPEN','2X');
 ins(regattaId,3,'Womens HS 2x',new Date(2013,9,02,10,05),'WOMEN',['H'],'OPEN','4+');
 ins(regattaId,4,'Mens HS Novice 4+', new Date(2013,9,02,10,8),'MEN',['H'],'OPEN','4+');
 ins(regattaId,5,'Womens HS Novice 4+',new Date(2013,9,02,10,10),'WOMEN',['H'],'OPEN','4+');
 ins(regattaId,6,'Mens HS Novice Gig/1x',new Date(2013,9,02,10,12),'MEN',['H'],'OPEN','1x');
 ins(regattaId,7,'Womens HS Novice Gig/1x',new Date(2013,9,02,10,13),'WOMEN',['H'],'OPEN','1x');
 ins(regattaId,8,'Mens HS 4+',new Date(2013,9,02,10,15),'MEN',['H'],'OPEN','4+');
 ins(regattaId,9,'Womens HS 4+',new Date(2013,9,02,10,20),'WOMEN',['H'],'OPEN','4+');
 ins(regattaId,10,'Mens HS Novice 8+',new Date(2013,9,02,10,25),'MEN',['H'],'OPEN','8+');
 ins(regattaId,11,'Womens HS Novice 8+',new Date(2013,9,02,10,27),'WOMEN',['H'],'OPEN','8+');
 ins(regattaId,14,'Mens HS 4x',new Date(2013,9,02,10,28),'MEN',['H'],'OPEN','4X');
 ins(regattaId,15,'Womens HS 4x',new Date(2013,9,02,10,33),'WOMEN',['H'],'OPEN','4X');
 ins(regattaId,16,'Mens HS 8+',new Date(2013,9,02,10,35),'MEN',['H'],'OPEN','8+');
 ins(regattaId,17,'Womens HS 8+',new Date(2013,9,02,10,37),'WOMEN',['H'],'OPEN','8+');
 ins(regattaId,18,'Mens HS 1x',new Date(2013,9,02,10,40),'MEN',['H'],'OPEN','1X');
 ins(regattaId,21,'Mens Collegiate 4+',new Date(2013,9,02,10,42),'MEN',['JV'],'OPEN','4+');
 ins(regattaId,24,'Womens Collegiate 2x',new Date(2013,9,02,10,44),'WOMEN',['JV'],'OPEN','2X');
 ins(regattaId,25,'Mixed Masters 2x',new Date(2013,9,02,10,46),'MIX',['AA'],'OPEN','2X');
 ins(regattaId,32,'Mens Masters 1x',new Date(2013,9,02,10,48),'MEN',['AA'],'OPEN','1X');
 ins(regattaId,33,'Womens Masters 1x',new Date(2013,9,02,10,53),'WOMEN',['AA'],'OPEN','1X');
 ins(regattaId,37,'Mens Masters 2x',new Date(2013,9,02,10,56),'MEN',['AA'],'OPEN','2X');
 ins(regattaId,38,'Womens Masters 2x',new Date(2013,9,02,10,57),'WOMEN',['AA'],'OPEN','2X');
 ins(regattaId,44,'Womens Masters 4x',new Date(2013,9,02,10,59),'WOMEN',['AA'],'OPEN','4x');
 ins(regattaId,47,'Womens Collegiate Novice 8+',new Date(2013,9,02,11),'WOMEN',['JV'],'OPEN','8+');
 ins(regattaId,49,'Corporate Challenge/Business Schools Mixed 8+',new Date(2013,9,02,11),'MIX',['JV'],'OPEN','8+');

 logger.info('creating test data - Teams','main.js');

 Teams.insert(new Team('PCR','Philadelphia City Rowing','Philly Rowing',[
   { boatClass:'LM2',crew:{name:'A',competitors:['F.Smith', 'G.Jones']} },
   { boatClass:'LM2',crew:{name:'B',competitors:['G.Alexis','F.Nonce']} },
   { boatClass:'LM2',crew:{name:'C',competitors:['Q.Zebra','Y.Xacti']} } 
   ]
  ).toJSONValue());

 Teams.insert(new Team('WC','Wharton Crew','Wharton',[
   { boatClass:'LM2',crew:{name:'A',competitors:['F.Smith', 'G.Jones']} },
   { boatClass:'LM2',crew:{name:'B',competitors:['G.Alexis','F.Nonce']} },
   { boatClass:'LM2',crew:{name:'C',competitors:['Q.Zebra','Y.Xacti']} } 
   ]
  ).toJSONValue());

 Teams.insert(new Team('SRA','Sagamore Rowing Association','Sagamore RA',[
   { boatClass:'LM2',crew:{name:'A',competitors:['D.Taylor','C.Ryan']} },
   { boatClass:'LM2',crew:{name:'B',competitors:['E.Placeholder2','E.Placeholder1']} }
   ]
  ).toJSONValue());

 Teams.insert(new Team('UBC','Undine Barge Club','Undine',[
   { boatClass:'LM2',crew:{name:'A',competitors:['J.Cipolla','J.Haines']} },
   ]
  ).toJSONValue());

 race = Races.findOne({number: 51});
 Crews.insert({raceId: race._id, bow: 74, crew: 'WC A (C. Lindborg)'});
 Crews.insert({raceId: race._id, bow: 73, crew: 'WC B (M. Funk)'});

 race = Races.findOne({number: 50});
 Crews.insert({raceId: race._id, bow: 72, crew: 'Bachelors/Vesper/University [Composite] (M. Hilf)'});

 // {raceId: race._id, place: 2, bow: 6, crew: 'Undine (J.Cipolla, J.Haines)', nettime: new Date(2013,9,02,14:39.82.000'), percent: null, delta: '14:39.82', raw: '14:39.82', handicap: null, penalty: null, start: '08:44:36.97', finish: '08:59:16.79'});

 race = Races.findOne({number: 1});
 Crews.insert({raceId: race._id, place: 1, bow: 7, crew: 'Sagamore RA A (D.Taylor, C.Ryan)', nettime: '00:00.00'});
 Crews.insert({raceId: race._id, place: 2, bow: 6, crew: 'Undine (J.Cipolla, J.Haines)', nettime: '14:39.82', delta: '14:39.82', raw: '14:39.82', start: '08:44:36.97', finish: '08:59:16.79'});
 Crews.insert({raceId: race._id, place: 3, bow: 3, crew: 'Penn Ltw A (J.Davrace._id, P.Lange)', nettime: '14:39.86', delta: '00:00.04', raw: '14:39.86', start: '08:44:27.30', finish: '08:59:07.16'});
 Crews.insert({raceId: race._id, place: 4, bow: 14, crew: 'Sagamore RA  (E.Placeholder2, E.Placeholder1)', nettime: '14:42.67', delta: '00:02.81', raw: '14:42.67', start: '08:44:55.32', finish: '08:59:37.99'});
 Crews.insert({raceId: race._id, place: 5, bow: 4, crew: 'Penn Ltw B (D.Schwarz, P.Song)', nettime: '14:49.16', delta: '00:06.49', raw: '14:49.16', start: '08:44:13.92', finish: '08:59:03.08'});
 Crews.insert({raceId: race._id, place: 6, bow: 1, crew: 'U Penn (S.Shepherd, L.Kaminski)', nettime: '16:29.51', delta: '01:40.35', raw: '16:29.51', start: '08:43:58.04', finish: '09:00:27.55'});
 Crews.insert({raceId: race._id, place: 7, bow: 2, crew: 'Sarah Lawrence (O.Marks, N.Rademaker)', nettime: '02:50.20', delta: '46:20.69', raw: '02:50.20', finish: '09:02:50.20'});

 race = Races.findOne({number: 2});
 Crews.insert({raceId: race._id, bow: 2, crew: 'Bachelors (A. Williams)'});
 Crews.insert({raceId: race._id, bow: 1, crew: 'Crescent (L. Mason)'});
 Crews.insert({raceId: race._id, bow: 3, crew: 'Upper Merion HS (A. Chui)'});

 race = Races.findOne({number: 3});
 Crews.insert({raceId: race._id, bow: 6, crew: 'Bachelors A (T. Gilad)'});
 Crews.insert({raceId: race._id, bow: 7, crew: 'Bachelors B (A. Jain)'});
 Crews.insert({raceId: race._id, bow: 4, crew: 'Bonner/Prendergast (E. Dougherty)'});
 Crews.insert({raceId: race._id, bow:	5, crew: 'Upper Merion HS (R. Willgruber)'});
 Crews.insert({raceId: race._id, bow:	8, crew: 'Bachelors C (Y. Randall)'});

 race = Races.findOne({number: 4});
 Crews.insert({raceId: race._id, bow: 9, crew: 'Philadelphia City Rowing (K. Wilson)'});

 race = Races.findOne({number: 5});
 Crews.insert({raceId: race._id, bow: 10, crew: 'Philadelphia City Rowing (C. kapps-gibson)'});

 race = Races.findOne({number: 6});
 Crews.insert({raceId: race._id, bow: 12, crew: 'Bonner/Prendergast (D. Dwyer)'});
 Crews.insert({raceId: race._id, bow: 11, crew: 'Bonner/Prendergast (B. McElwee)'});

 race = Races.findOne({number: 7});
 Crews.insert({raceId: race._id, bow: 13, crew: 'Bachelors (I. Zimmer)'});

 race = Races.findOne({number: 8});
 Crews.insert({raceId: race._id, bow: 14, crew: 'Upper Merion HS (B. Painter)'});
 Crews.insert({raceId: race._id, bow: 16, crew: 'Bonner/Prendergast (j. D\'imperio)'});
 Crews.insert({raceId: race._id, bow: 17, crew: 'RFH Rowing (T. Reilly)'});
 Crews.insert({raceId: race._id, bow:	15, crew: 'Philadelphia City Rowing (A. SmCrews.insert({raceId: race._id, bow:)'});

  race = Races.findOne({number: 9});
  Crews.insert({raceId: race._id, bow: 18, crew: 'Bonner/Prendergast (C. Savage)'});
  Crews.insert({raceId: race._id, bow: 22, crew: 'Upper Merion HS A (M. Rodriguez)'});
  Crews.insert({raceId: race._id, bow: 9, crew: 'Philadelphia City Rowing (K. Jones)'});
  Crews.insert({raceId: race._id, bow: 0, crew: 'RFH Rowing (K. Edwards)'});
  Crews.insert({raceId: race._id, bow: 1, crew: 'Upper Merion HS B (S. Rose)'});

  race = Races.findOne({number: 10});
  Crews.insert({raceId: race._id, bow: 24, crew: 'Philadelphia City Rowing (M. Turner)'});
  Crews.insert({raceId: race._id, bow: 23, crew: 'RFH Rowing (j. Kingdon)'});

  race = Races.findOne({number: 11});
  Crews.insert({raceId: race._id, bow: 25, crew: 'Philadelphia City Rowing (C. Nemati)'});

  race = Races.findOne({number: 14});
  Crews.insert({raceId: race._id, bow: 28, crew: 'Crescent A (B. Weaver)'});
  Crews.insert({raceId: race._id, bow: 26, crew: 'Crescent C (I. Soltero)'});
  Crews.insert({raceId: race._id, bow: 31, crew: 'Crescent B (S. Mooney)'});
  Crews.insert({raceId: race._id, bow: 29, crew: 'Crescent E (J. Brauckmann)'});
  Crews.insert({raceId: race._id, bow: 30, crew: 'Bachelors (M. Maccoll)'});
  Crews.insert({raceId: race._id, bow: 27, crew: 'RFH Rowing (F. Orejarena)'});
  Crews.insert({raceId: race._id, bow: 2, crew: 'Crescent D (T. Kutchner)'});

  race = Races.findOne({number: 15});
  Crews.insert({raceId: race._id, bow: 33, crew: 'Bachelors A (B. Kaufmann)'});
  Crews.insert({raceId: race._id, bow: 34, crew: 'Bachelors B (H. Cramer)'});
  Crews.insert({raceId: race._id, bow: 5, crew: 'Bachelors C (S. Lament)'});

  race = Races.findOne({number: 16});
  Crews.insert({raceId: race._id, bow: 36, crew: 'Philadelphia City Rowing (J. Garcia)'});

  race = Races.findOne({number: 17});
  Crews.insert({raceId: race._id, bow: 37, crew: 'Mount Saint Joseph B (D. Mischler)'});
  Crews.insert({raceId: race._id, bow: 38, crew: 'Philadelphia City Rowing A (K. Romano)'});
  Crews.insert({raceId: race._id, bow: 39, crew: 'Mount Saint Joseph A (S. Cocozza)'});
  Crews.insert({raceId: race._id, bow: 42, crew: 'Mount Saint Joseph C (K. Stromberg)'});
  Crews.insert({raceId: race._id, bow: 41, crew: 'Philadelphia City Rowing B (M. Cosgrove)'});
  Crews.insert({raceId: race._id, bow: 40, crew: 'RFH Rowing (C. Tardiff)'});

  race = Races.findOne({number: 18});
  Crews.insert({raceId: race._id, bow: 45, crew: 'Bonner/Prendergast (C. Nichols)'});
  Crews.insert({raceId: race._id, bow: 44, crew: 'Crescent (P. Scharf)'});
  Crews.insert({raceId: race._id, bow: 3, crew: 'Bachelors (G. Goldstien)'});
  Crews.insert({raceId: race._id, bow: 5, crew: 'Vesper/Fairmont (M. Melnik)'});

  race = Races.findOne({number: 21});
  Crews.insert({raceId: race._id, bow: 6, crew: 'Richard Stockton (S. MacPhee)'});

  race = Races.findOne({number: 24});
  Crews.insert({raceId: race._id, bow: 7, crew: 'Richard Stockton (E. Baldwin)'});

  race = Races.findOne({number: 25});
  Crews.insert({raceId: race._id, bow: 49, crew: 'Bachelors (S. Scott)'});
  Crews.insert({raceId: race._id, bow: 50, crew: 'Vesper (R. Jones)'});
  Crews.insert({raceId: race._id, bow: 48, crew: 'Crescent (D. Gormley)'});

  race = Races.findOne({number: 32});
  Crews.insert({raceId: race._id, bow: 53, crew: 'Unaff. (USA) (M. Waggaman)'});
  Crews.insert({raceId: race._id, bow: 52, crew: 'Fairmount (j. gaughan)'});
  Crews.insert({raceId: race._id, bow: 51, crew: 'Malta (S. Ferenczy)'});
  Crews.insert({raceId: race._id, bow: 55, crew: 'Bachelors (M. Levy)'});
  Crews.insert({raceId: race._id, bow: 57, crew: 'University (M. Dencker)'});
  Crews.insert({raceId: race._id, bow: 56, crew: 'Fairmount (t. kowalik)'});
  Crews.insert({raceId: race._id, bow: 4, crew: 'Vesper (D. Melnik)'});

  race = Races.findOne({number: 33});
  Crews.insert({raceId: race._id, bow: 61, crew: 'Vesper (E. Saint Clair)'});
  Crews.insert({raceId: race._id, bow: 59, crew: 'Bachelors (C. Pavlak)'});
  Crews.insert({raceId: race._id, bow: 58, crew: 'Undine (M. Ionescu)'});
  Crews.insert({raceId: race._id, bow: 62, crew: 'Vesper (B. Meehan)'});
  Crews.insert({raceId: race._id, bow: 0, crew: 'Crescent (L. Geddes)'});

  race = Races.findOne({number: 37});
  Crews.insert({raceId: race._id, bow: 63, crew: 'University (H. Bodek)'});
  Crews.insert({raceId: race._id, bow: 64, crew: 'Undine (J. Clark)'});

  race = Races.findOne({number: 38});
  Crews.insert({raceId: race._id, bow: 66, crew: 'University (K. Cook)'});
  Crews.insert({raceId: race._id, bow: 67, crew: 'Bachelors/University [Composite] A (M. Hilf)'});
  Crews.insert({raceId: race._id, bow: 65, crew: 'Bachelors B (L. Alfieri)'});

  race = Races.findOne({number: 44});
  Crews.insert({raceId: race._id, bow: 68, crew: 'Bachelors (H. Hennes)'});

  race = Races.findOne({number: 47});
  Crews.insert({raceId: race._id, bow: 9, crew: 'Richard Stockton (E. Fisher)'});

  race = Races.findOne({number: 49});
  Crews.insert({raceId: race._id, bow: 1, crew: 'Wharton B (P. Morgan)'});
  Crews.insert({raceId: race._id, bow: 2, crew: 'Wharton A (J. Scott)'});

function getCrewIdForBow(bow) { 
 crew = Crews.find({bow: bow}); 
 if (crew) {
  return crew._id;
 }
}

raceCourse = {
 regattaId: regattaId,
 raceCourseStatus: 'OPEN',
 officials: [
   { name: 'S.Tart', marker: 'Start' },
   { name: 'F.Irst', marker: 1000 },
   { name: 'S.Econd',marker: 2000 },
   { name: 'T.Hird', marker: 3000 },
   { name: 'F.Inish',marker: 'Finish' }
  ],
 markers: [ 'start', 1000, 2000, 3000, 'finish' ], // markers where timers are positioned
 races: [ 32, 33, 37 ],
 lanes: [ 
   {
    number: 1,
    crews: [
      {
       crewId: getCrewIdForBow(11),
       race: 32,
       bow: 11,
       name: 'PCR LWT 2+ A',
       startAt: 999999999999,// in milliseconds 
       lastMarker: 1000,
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED'
       buoys: 0,
       isProtested: false
     },
     {
       crewId: getCrewIdForBow(18),
       race: 33,
       bow: 18,
       name: 'WRTN MS4X C',
       startAt: 999999999999,// in milliseconds 
       lastMarker: 'start',
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED'
       buoys: 0,
       isProtested: false
     },
     {
       crewId: getCrewIdForBow(22),
       race: 37,
       bow: 22,
       name: 'RUTG MENS MASTERS 4+',
       startAt: 0,// in milliseconds 
       lastMarker: null,
       lastMarkerAt: 0, // in milliseconds
       raw: 0, // lastMarkerAt - startAt
       handicap: 0, // milliseconds
       boatStatus: 'START', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     }
    ]
   },
   {
    number: 2,
    crews: [
     {
       crewId: getCrewIdForBow(12),
       race: 32,
       bow: 12,
       name: 'UNDN LWT 2+ B',
       startAt: 999999999999,// in milliseconds 
       lastMarker: 1000,
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     },
     {
       crewId: getCrewIdForBow(22),
       race: 33,
       bow: 22,
       name: 'UPENN MS4X C ',
       startAt: 999999999999,// in milliseconds 
       lastMarker: 'start',
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     },
     {
       crewId: getCrewIdForBow(32),
       race: 37,
       bow: 32,
       name: 'FAIRMNT MENS MASTERS 4+',
       startAt: 0,// in milliseconds 
       lastMarker: null,
       lastMarkerAt: 0, // in milliseconds
       raw: 0, // lastMarkerAt - startAt
       handicap: 0, // milliseconds
       boatStatus: 'START', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     }
    ]
   },
   {
    number: 3,
    crews: [
     {
       crewId: getCrewIdForBow(13),
       race: 32,
       bow: 13,
       name: 'UNDN LWT 2+ B',
       startAt: 999999999999,// in milliseconds 
       lastMarker: 1000,
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     },
     {
       crewId: getCrewIdForBow(23),
       race: 33,
       bow: 23,
       name: 'UPENN MS4X C ',
       startAt: 999999999999,// in milliseconds 
       lastMarker: 'start',
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     },
     {
       crewId: getCrewIdForBow(33),
       race: 37,
       bow: 33,
       name: 'FAIRMNT MENS MASTERS 4+',
       startAt: 0,// in milliseconds 
       lastMarker: null,
       lastMarkerAt: 0, // in milliseconds
       raw: 0, // lastMarkerAt - startAt
       handicap: 0, // milliseconds
       boatStatus: 'START', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     }
    ]
   },
   {
    number: 4,
    crews: [
     {
       crewId: getCrewIdForBow(14),
       race: 32,
       bow: 14,
       name: 'UNDN LWT 2+ B',
       startAt: 999999999999,// in milliseconds 
       lastMarker: 1000,
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     },
     {
       crewId: getCrewIdForBow(24),
       race: 33,
       bow: 24,
       name: 'UPENN MS4X C ',
       startAt: 999999999999,// in milliseconds 
       lastMarker: 'start',
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     },
     {
       crewId: getCrewIdForBow(34),
       race: 37,
       bow: 34,
       name: 'FAIRMNT MENS MASTERS 4+',
       startAt: 0,// in milliseconds 
       lastMarker: null,
       lastMarkerAt: 0, // in milliseconds
       raw: 0, // lastMarkerAt - startAt
       handicap: 0, // milliseconds
       boatStatus: 'START', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     }
    ]
   },
   {
    number: 5,
    crews: [
     {
       crewId: getCrewIdForBow(15),
       race: 32,
       bow: 15,
       name: 'UNDN LWT 2+ B',
       startAt: 999999999999,// in milliseconds 
       lastMarker: 1000,
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     },
     {
       crewId: getCrewIdForBow(19),
       race: 33,
       bow: 19,
       name: 'UPENN MS4X C ',
       startAt: 999999999999,// in milliseconds 
       lastMarker: 'start',
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     },
     {
       crewId: getCrewIdForBow(35),
       race: 37,
       bow: 35,
       name: 'FAIRMNT MENS MASTERS 4+',
       startAt: 0,// in milliseconds 
       lastMarker: null,
       lastMarkerAt: 0, // in milliseconds
       raw: 0, // lastMarkerAt - startAt
       handicap: 0, // milliseconds
       boatStatus: 'START', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     }
    ]
   },
   {
    number: 6,
    crews: [
     {
       crewId: getCrewIdForBow(16),
       race: 32,
       bow: 16,
       name: 'UNDN LWT 2+ B',
       startAt: 999999999999,// in milliseconds 
       lastMarker: 1000,
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     },
     {
       crewId: getCrewIdForBow(26),
       race: 33,
       bow: 26,
       name: 'UPENN MS4X C ',
       startAt: 999999999999,// in milliseconds 
       lastMarker: 'start',
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     },
     {
       crewId: getCrewIdForBow(36),
       race: 37,
       bow: 36,
       name: 'FAIRMNT MENS MASTERS 4+',
       startAt: 0,// in milliseconds 
       lastMarker: null,
       lastMarkerAt: 0, // in milliseconds
       raw: 0, // lastMarkerAt - startAt
       handicap: 0, // milliseconds
       boatStatus: 'START', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     }
    ]
   }
  ], // end of lanes
 notices: [],
 protests: []
};

RaceCourses.insert(raceCourse);

  logger.info('finished loading test data','main.js');
 }
