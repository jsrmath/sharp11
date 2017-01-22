// jazz.js

var chord = require('./chord');
var note = require('./note');
var interval = require('./interval');
var _ = require('underscore');

// Map for roman numerals
var romanNumeral = [null, 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

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

  return null;
};

// Given a key and a note, return a roman numeral representing the note
var getNumeral = function (key, n) {
  var int;
  var numeral;

  try {
    int = key.getInterval(n);
  } catch (err) {
    int = key.getInterval(n.clean());
  }

  // Although dim7, for example, is a valid interval, we don't want a bbVII in our symbol
  if (!interval.isPerfect(int.number) && int.quality === 'dim') {
    int = interval.create(int.number - 1, 'M');
  }

  numeral = romanNumeral[int.number];

  if (int.quality === 'm' || int.quality === 'dim') numeral = 'b' + numeral;
  if (int.quality === 'aug') numeral = '#' + numeral;

  return numeral;
};

// A symbol that is used in the jazz automaton.  Each symbol can be thought of as a roman numeral
// representing a chord using the Mehegan system.
var Symbol = function (key, ch) {
  key = note.create(key);
  ch = chord.create(ch);

  // Chord quality: M, m, x, o, ø, or null if invalid
  this.quality = getQuality(ch);

  // The number of half-steps between the key and the chord
  // e.g. I => 0, bIV => 6
  this.interval = key.getHalfSteps(ch.root);

  // Roman numeral representing chord
  this.numeral = getNumeral(key, ch.root);

  this.toString = function () {
    return this.numeral + this.quality;
  };
};

// Test for equality with other symbols 
Symbol.prototype.eq = function (symbol) {
  return this.interval === symbol.interval && this.quality === symbol.quality;
};

module.exports.Symbol = Symbol;
