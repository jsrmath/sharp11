// mehegan.js

var chord = require('./chord');
var note = require('./note');
var interval = require('./interval');
var _ = require('underscore');

// Map for roman numerals
var romanNumeral = [null, 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// Map for Mehegan qualities
var meheganQuality = [null, 'M', 'm', 'm', 'M', 'x', 'm', 'ø'];

// Given a chord, return the Mehegan quality
var getQuality = function (ch) {
  if (ch.hasInterval('M3')) {
    return ch.hasInterval('m7') ? 'x' : 'M';
  }

  if (ch.hasInterval('m3')) {
    if (ch.hasInterval('dim5')) {
      return ch.hasInterval('m7') ? 'ø' : 'o';
    }

    return 'm';
  }

  if (ch.hasInterval('P4')) {
    return 's';
  }

  return null;
};

// Given a key and a note, return a roman numeral representing the note
var getNumeral = function (key, n) {
  var int;
  var numeral;

  try {
    int = key.getInterval(n);
  } catch (err) {
    try {
      int = key.getInterval(n.clean());
    } catch (err2) {
      int = key.getInterval(n.toggleAccidental());
    }
  }

  // Although dim7, for example, is a valid interval, we don't want a bbVII in our symbol
  if (!interval.isPerfect(int.number) && int.quality === 'dim') {
    int = interval.parse((int.number - 1).toString());
  }

  numeral = romanNumeral[int.number];

  if (int.quality === 'm' || int.quality === 'dim') numeral = 'b' + numeral;
  if (int.quality === 'aug') numeral = '#' + numeral;

  return numeral;
};

// Given a roman numeral, return the number of half steps
var getHalfSteps = function (numeral) {
  var matches = numeral.match(/([b#]?)([iIvV]+)/);
  var halfSteps = interval.parse(_.indexOf(romanNumeral, matches[2]).toString()).halfSteps();

  if (matches[1] === 'b') halfSteps -= 1;
  if (matches[1] === '#') halfSteps += 1;

  return halfSteps;
};

// Given a roman numeral, infer the Mehegan chord qualitiy
var inferQuality = function (numeral) {
  return meheganQuality[_.indexOf(romanNumeral, numeral)];
};

// A roman numeral symbol representing a chord using the Mehegan system
var Mehegan = function (numeral, quality) {
  // Roman numeral representing chord
  this.numeral = numeral;

  // Chord quality: M, m, x, o, ø, s
  this.quality = quality;
  if (!_.contains(['M', 'm', 'x', 'o', 'ø', 's'], quality)) {
    throw new Error('Invalid chord quality');
  }

  // The number of half-steps between the key and the chord
  // e.g. I => 0, bIV => 6
  this.interval = getHalfSteps(numeral);

  this.toString = function () {
    return this.numeral + this.quality;
  };
};

// Create a Mehegan symbol given a key and a chord
var fromChord = function (key, ch) {
  key = note.create(key || 'C');
  ch = chord.create(ch);

  return new Mehegan(getNumeral(key, ch.root), getQuality(ch));
};

var fromChords = function (key, chords) {
  return _.map(chords, _.partial(fromChord, key));
};

// Create a Mehegan symbol given a Mehegan string
var fromString = function (str) {
  var matches = str.match(/([b#]?)([iIvV]+)([mMxoøs]?)/);
  var alteration;
  var numeral;
  var quality;

  if (!matches) {
    throw new Error('Invalid Mehegan symbol');
  }

  alteration = matches[1];
  numeral = matches[2].toUpperCase();
  quality = matches[3];

  if (!quality) quality = inferQuality(numeral);

  return new Mehegan(alteration + numeral, quality);
};

var fromStrings = _.partial(_.map, _, fromString);

// Given a Mehegan symbol, return the Mehegan symbol
// Given a Mehegan string, return it as a Mehegan symbol
// If a cache is given, will store and retrieve symbols based on string
var asMehegan = function (mehegan, cache) {
  if (mehegan instanceof Mehegan) return mehegan;

  // If no cache is provided, return string as Mehegan symbol
  if (!cache) return fromString(mehegan);

  // Otherwise, try to retrieve symbol from cache, creating a new symbol if it's not found
  if (!cache[mehegan]) cache[mehegan] = fromString(mehegan);
  return cache[mehegan];
};

var asMeheganArray = function (mehegans, cache) {
  return _.map(mehegans, _.partial(asMehegan, _, cache));
};

// Test for equality with other Mehegan symbols 
Mehegan.prototype.equals = Mehegan.prototype.eq = function (mehegan, cache) {
  mehegan = asMehegan(mehegan, cache);
  return this.interval === mehegan.interval && this.quality === mehegan.quality;
};

// Return the corresponding interval, e.g., bIII -> m3
Mehegan.prototype.toInterval = function () {
  var matches = this.numeral.match(/([b#]?)([iIvV]+)/);
  var alteration = matches[1];
  var numeral = matches[2];
  var intervalNumber = _.indexOf(romanNumeral, numeral);

  var intervalQuality = interval.isPerfect(intervalNumber) ? 'P' : 'M';

  if (alteration === 'b') {
    intervalQuality = interval.isPerfect(intervalNumber) ? 'dim' : 'm';
  }
  if (alteration === '#') {
    intervalQuality = 'aug';
  }

  return interval.create(intervalNumber, intervalQuality);
};

// Return a new Mehegan symbol transposed by the given interval
Mehegan.prototype.transpose = function (interval, down) {
  var n = note.create('C').transpose(this.toInterval()).transpose(interval, down).clean();
  return new Mehegan(getNumeral(note.create('C'), n), this.quality);
};

// Return a new Mehegan symbol with the given quality
Mehegan.prototype.withQuality = function (quality) {
  return new Mehegan(this.numeral, quality);
};

Mehegan.prototype.transposeDown = _.partial(Mehegan.prototype.transpose, _, true);

Mehegan.prototype.toChord = function (key) {
  var root = note.create(key || 'C').transpose(this.toInterval());
  var quality = {
    'M': 'M7',
    'm': 'm7',
    'x': '7',
    'o': 'o7',
    'ø': 'ø',
    's': '7sus'
  }[this.quality];

  return chord.create(root + quality);
};

Mehegan.prototype.toStylized = function () {
  var numeral = this.numeral;
  var quality = this.quality;
  var number = _.indexOf(romanNumeral, numeral);

  if (_.contains(['m', 'o', 'ø'], quality)) {
    numeral = numeral.toLowerCase();
  }

  if (quality === meheganQuality[number]) {
    quality = '';
  }

  return numeral + quality;
};

module.exports.fromChord = fromChord;
module.exports.fromString = fromString;
module.exports.fromChords = fromChords;
module.exports.fromStrings = fromStrings;
module.exports.asMehegan = asMehegan;
module.exports.asMeheganArray = asMeheganArray;
module.exports.Mehegan = Mehegan;
