// constants.js
// arrays of constant values that don't need to be MongoDB collections

crewTypes: [ // handicap = ((AGE - 27) ^ 2) * k
 { _id: '1x', rowers: 1, oar: 'scull', hasCox: false, k: 0.0250 },
 { _id: '2x', rowers: 2, oar: 'scull', hasCox: false, k: 0.0216 },
 { _id: '2-', rowers: 2, oar: 'sweep', hasCox: false, k: 0.0250 },
 { _id: '2+', rowers: 2, oar: 'sweep', hasCox: true,  k: 0.0250 },
 { _id: '4-', rowers: 4, oar: 'sweep', hasCox: false, k: 0.0216 },
 { _id: '4+', rowers: 4, oar: 'sweep', hasCox: true,  k: 0.0216 },
 { _id: '4x', rowers: 4, oar: 'scull', hasCox: false, k: 0.0200 },
 { _id: '4x+',rowers: 4, oar: 'scull', hasCox: true,  k: 0.0200 },
 { _id: '8+', rowers: 8, oar: 'sweep', hasCox: true,  k: 0.0200 },
 { _id: '8x', rowers: 8, oar: 'scull', hasCox: true,  k: 0.0200 }
];

raceStatuses: ['PENDING','RESTART','RESCHEDULED','STARTED','FINISHED','OFFICIAL','PROTESTED'];
protestStatuses: [ 'ACTIVE','UPHELD','LATE','APPEALED','WITHDRAWN','DENIED'];
protestTypes: ['FOUL','BROKEN_EQUIPMENT','SAFETY','OUTSIDE_ASSISTANCE','UNSPORTSMANLIKE_CONDUCT'];
penaltyTypes: ['REPRIMAND','WARNING','EXCLUSION','DISQUALIFICATION','RELEGATION','TIME','POSITION'];

ageCategories: [
 {_id:'JB',min:  1, max: 16 }, // Junior B
 {_id:'JR',min: 17, max: 20 }, // Junior
 {_id:'AA',min: 21, max: 26 }, // Masters
 {_id: 'A',min: 27, max: 35 },
 {_id: 'B',min: 36, max: 42 },
 {_id: 'C',min: 43, max: 49 },
 {_id: 'D',min: 50, max: 54 },
 {_id: 'E',min: 55, max: 59 },
 {_id: 'F',min: 60, max: 64 },
 {_id: 'G',min: 65, max: 69 },
 {_id: 'H',min: 70, max: 74 },
 {_id: 'I',min: 75, max: 79 },
 {_id: 'J',min: 80, max: 999}
];

// roles specify minimal update actions that can be performed
// a login can be associated with several roles
// [ 'OFFICIAL', 'REFEREE' ]
roles: [// login security roles
{ role: 'SYS',          description: 'system administrator'},
{ role: 'COACH',        description: 'team/crew coach'},
{ role: 'OFFICIAL',     description: 'course official'},
{ role: 'REFEREE',      description: 'race referee'},
{ role: 'CHIEF-JUDGE',  description: 'regatta chief-judge'},
{ role: 'RACE-DIRECTOR',description: 'regatta director'},
{ role: 'AUDIENCE',     description: 'anyone else'}
];

progressionLaneOrders: [
 {name: 'Middle out odd',    lanes: [3,4,2,5,1,6]},
 {name: 'Middle out even',   lanes: [4,3,5,2,6,1]},
 {name: 'Lowest to highest', lanes: [1,2,3,4,5,6]},
 {name: 'Highest to lowest', lanes: [6,5,4,3,2,1]}
];
