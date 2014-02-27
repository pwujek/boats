/** server/Progression.js
 * provides a function to initialize the progression rules
 */
 if (Progressions.find().count() < 1) {
  Progressions.insert( new Progression("US Rowing Progression System 'A' for 6-lane racing",6,
   [ 
    new ProgressionRule( 1,   6, 0,  3, 0, 0, 0, 0),
    new ProgressionRule( 7,   7, 2,  6, 0, 0, 0, 0),
    new ProgressionRule( 8,  12, 2,  3, 0, 0, 0, 0),
    new ProgressionRule(13,  15, 3,  2, 0, 0, 0, 0),
    new ProgressionRule(16,  18, 3,  4, 0, 0, 2, 0),
    new ProgressionRule(19,  24, 4,  3, 0, 0, 2, 3),
    new ProgressionRule(25,  36, 6,  2, 0, 0, 2, 3),
    new ProgressionRule(37,9999, 1, 18, 0, 0, 3, 2)
   ]
  ).toJSONValue());

  Progressions.insert( new Progression("US Rowing Progression System 'B' for 6-lane racing",6,
   [ 
    new ProgressionRule( 1,  6, 0, 0, 0, 0, 0, 0),
    new ProgressionRule( 7, 12, 2, 3, 0, 0, 3, 0),
    new ProgressionRule(13, 18, 3, 2, 0, 0, 2, 0),
    new ProgressionRule(19, 24, 4, 3, 0, 0, 3, 3),
    new ProgressionRule(25, 36, 6, 2, 0, 0, 2, 3),
    new ProgressionRule(37, 54, 9, 2, 0, 0, 2, 2)
   ]
  ).toJSONValue());

  Progressions.insert( new Progression("US Rowing Progression System 'C' for 7-lane racing",7,
   [ 
    new ProgressionRule( 1,  7, 0, 0, 0, 0, 0, 0),
    new ProgressionRule( 8, 14, 2, 3, 0, 0, 0, 0),
    new ProgressionRule(15, 21, 3, 4, 0, 0, 2, 3),
    new ProgressionRule(22, 28, 4, 3, 0, 0, 2, 3),
    new ProgressionRule(29, 42, 6, 3, 0, 0, 3, 2),
    new ProgressionRule(43, 63, 9, 2, 0, 0, 3, 2)
   ]
  ).toJSONValue());

  Progressions.insert( new Progression("US Rowing Alternate Progression System 'A' for 6-lane racing",6,
   [ 
    new ProgressionRule( 1,   6, 0,  0, 0, 0, 0, 0),
    new ProgressionRule( 7,   8, 2,  1, 2, 4, 0, 0),
    new ProgressionRule( 9,  12, 2,  3, 1, 2, 2, 0),
    new ProgressionRule(13,  15, 3,  1, 3, 3, 2, 3),
    new ProgressionRule(16,  18, 3,  3, 3, 3, 2, 3),
    new ProgressionRule(19,  24, 4,  4, 4, 2, 2, 3),
    new ProgressionRule(25,  36, 6,  6, 6, 1, 2, 3),
    new ProgressionRule(37,9999, 1,  6, 6, 1, 3, 3)
   ]
  ).toJSONValue());
  Progressions.insert( new Progression("US Rowing Alternate Progression System 'B' for 7-lane racing",7,
   [ 
    new ProgressionRule( 1,   7, 0,  0, 0, 0, 0, 0),
    new ProgressionRule( 8,  11, 2,  2, 1, 2, 0, 0),
    new ProgressionRule(12,  14, 2,  1, 2, 2, 2, 0),
    new ProgressionRule(15,  15, 3,  3, 1, 3, 2, 0),
    new ProgressionRule(17,  20, 3,  2, 2, 3, 2, 3),
    new ProgressionRule(21,  22, 4,  2, 2, 2, 2, 3),
    new ProgressionRule(23,  28, 4,  1, 4, 2, 2, 3),
    new ProgressionRule(29,  42, 6,  1, 6, 2, 3, 2),
    new ProgressionRule(43,9999, 9,  1, 9, 1, 3, 2)
   ]
  ).toJSONValue());
 }
