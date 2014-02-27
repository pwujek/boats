/**
 * example of a racecourse with 2 lanes in use.
 * - each lane has an array of the boats currently racing:
 * 1. when boats move up to the start they have a boatStatus = 'START'
 * 2. when the boat has started it has boatStatus = 'RACING'
 * 3. when a boat passes the finish line it get boatStatus = 'FINISHED'
 *    after which it will be removed from the list (possibly after a specific delay)
 */
raceCourse = {
 regattaId: '??????????',
 raceCourseStatus: 'OPEN',
 officials: [
   { 'S.Tart', 'Start' },
   { 'F.Irst', 1000 },
   { 'S.Econd',2000 },
   { 'T.Hird', 3000 },
   { 'F.Inish','Finish' }
  ],
 markers: [ 1000, 2000, 3000 ], // markers where timers are positioned
 lanes: [ 
   {
    lane: 1,
    crews: [
      {
       crewId: '??????????',
       race: 30,
       bow: 12,
       name: 'PCR LWT 2+ A',
       startAt: 999999999999 // in milliseconds 
       lastMarker: 1000,
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED'
       buoys: 0,
       isProtested: false
     },
     {
       crewId: '??????????',
       race: 31,
       bow: 18,
       name: 'WRTN MS4X C',
       startAt: 999999999999 // in milliseconds 
       lastMarker: 'start',
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED'
       buoys: 0,
       isProtested: false
     },
     {
       crewId: '??????????',
       race: 32,
       bow: 22,
       name: 'RUTG MENS MASTERS 4+',
       startAt: 0 // in milliseconds 
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
    lane: 2,
    crews: [
     {
       crewId: '??????????',
       race: 30,
       bow: 13,
       name: 'UNDN LWT 2+ B',
       startAt: 999999999999 // in milliseconds 
       lastMarker: 1000,
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     },
     {
       crewId: '??????????',
       race: 31,
       bow: 18,
       name: 'UPENN MS4X C ',
       startAt: 999999999999 // in milliseconds 
       lastMarker: 'start',
       lastMarkerAt: 999999999999, // in milliseconds
       raw: 999999, // lastMarkerAt - startAt
       handicap: 99999, // milliseconds
       boatStatus: 'RACING', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     },
     {
       crewId: '??????????',
       race: 32,
       bow: 22,
       name: 'FAIRMNT MENS MASTERS 4+',
       startAt: 0 // in milliseconds 
       lastMarker: null,
       lastMarkerAt: 0, // in milliseconds
       raw: 0, // lastMarkerAt - startAt
       handicap: 0, // milliseconds
       boatStatus: 'START', // 'START','RACING','SCRATCH','FINISHED','PROTESTED'
       buoys: 0
     }

    ]
   },
  ], // end of lanes
 notices: [],
 protests: []
};

