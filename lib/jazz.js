// jazz.js

var chord = require('./chord');
var note = require('./note');
var interval = require('./interval');
var _ = require('underscore');

// Map for roman numerals
var romanNumeral = [null, 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// Map for Mehegan qualities
var meheganQuality = [null, 'M', 'm', 'm', 'M', 'M', 'm', 'ø'];

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

// Given a roman numeral and an alteration (b or #), return the number of half steps
var getHalfSteps = function (numeral, alteration) {
  var halfSteps = interval.parse(_.indexOf(romanNumeral, numeral).toString()).halfSteps();

  if (alteration === 'b') halfSteps -= 1;
  if (alteration === '#') halfSteps += 1;

  return halfSteps;
};

// Given a roman numeral, infer the Mehegan chord qualitiy
var inferQuality = function (numeral) {
  return meheganQuality[_.indexOf(romanNumeral, numeral)];
}

// A symbol that is used in the jazz automaton.  Each symbol can be thought of as a roman numeral
// representing a chord using the Mehegan system.
var Symbol = function (interval, quality, numeral) {
  // The number of half-steps between the key and the chord
  // e.g. I => 0, bIV => 6
  this.interval = interval;

  // Chord quality: M, m, x, o, ø
  this.quality = quality;
  if (!_.contains(['M', 'm', 'x', 'o', 'ø'], quality)) {
    throw new Error('Invalid chord quality');
  }

  // Roman numeral representing chord
  this.numeral = numeral;

  this.toString = function () {
    return this.numeral + this.quality;
  };
}

// Create a symbol given a key and a chord
var symbolFromChord = function (key, ch) {
  key = note.create(key);
  ch = chord.create(ch);

  return new Symbol(key.getHalfSteps(ch.root), getQuality(ch), getNumeral(key, ch.root));
};

// Create a symbol given a Mehegan chord
var symbolFromMehegan = function (mehegan) {
  var matches = mehegan.match(/([b#]?)([iIvV]+)([mMxoø]?)/);
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

  return new Symbol(getHalfSteps(numeral, alteration), quality, alteration + numeral);
};

// Test for equality with other symbols 
Symbol.prototype.eq = function (symbol) {
  return this.interval === symbol.interval && this.quality === symbol.quality;
};

var JzState = function (name) {
  this.name = name;
  this.transitions = [];
  this.sources = [];
};

JzState.prototype.addTransition = function (symbol, state) {
  this.transitions.push({symbol: symbol, state: state});
  state.sources.push({symbol: symbol, state: this});
};

JzState.prototype.addSource = function (symbol, state) {
  this.sources.push({symbol: symbol, state: state});
  state.transitions.push({symbol: symbol, state: this});
};

var JzA = function () {
  this.states = [];
};

JzA.prototype.addState = function (name) {
  var state = new JzState(name);
  this.states.push(state);
  return state;
};

JzA.prototype.addTransition = function (symbol, from, to) {
  from.addTransition(symbol, to);
};

JzA.prototype.getTransitions = function () {
  return _.chain(this.states)
  .map(function (state) {
    return _.map(state.transitions, function (transition) {
      return {symbol: transition.symbol, from: state, to: transition.state};
    });
  })
  .flatten()
  .value();
};

JzA.prototype.getTransitionsBySymbol = function (symbol) {
  return _.filter(this.getTransitions(), function (t) {
    return t.symbol.eq(symbol);
  })
};

var constructDefaultJzA = function (jza) {
  return jza;
};

module.exports.symbolFromChord = symbolFromChord;
module.exports.symbolFromMehegan = symbolFromMehegan;

module.exports.jza = function (type) {
  var jza = new JzA();

  if (type !== 'empty') {
    constructDefaultJzA(jza);
  }

  return jza;
};
