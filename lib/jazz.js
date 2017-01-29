// jazz.js

var chord = require('./chord');
var note = require('./note');
var interval = require('./interval');
var _ = require('underscore');

// Map for roman numerals
var romanNumeral = [null, 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// Map for Mehegan qualities
var meheganQuality = [null, 'M', 'm', 'm', 'M', 'x', 'm', 'ø'];

var tonicChords = [
  'IM', 'Im', 'Ix', 'Iø',
  'IIIM', 'IIIm', 'IIIx', 'IIIø',
  'bIIIM', 'bIIIm', 'bIIIx', 'bIIIø',
  'VIM', 'VIm', 'VIx', 'VIø',
  'bVIM', 'bVIm', 'bVIx', 'bVIø',
];
var subdominantChords = [
  'IIM', 'IIm', 'IIx', 'IIø',
  'IVM', 'IVm', 'IVx', 'IVø',
  'VIM', 'VIm', 'VIx', 'VIø',
  'bVIM', 'bVIm', 'bVIx', 'bVIø'
];
var dominantChords = ['IIIx', 'bIIIx', 'Vx', 'VIIx', 'bVIIx'];

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

// A symbol that is used in the jazz automaton.  Each symbol can be thought of as a roman numeral
// representing a chord using the Mehegan system.
var Symbol = function (numeral, quality) {
  // Roman numeral representing chord
  this.numeral = numeral;

  // Chord quality: M, m, x, o, ø
  this.quality = quality;
  if (!_.contains(['M', 'm', 'x', 'o', 'ø'], quality)) {
    throw new Error('Invalid chord quality');
  }

  // The number of half-steps between the key and the chord
  // e.g. I => 0, bIV => 6
  this.interval = getHalfSteps(numeral);

  this.toString = function () {
    return this.numeral + this.quality;
  };
};

// Create a symbol given a key and a chord
var symbolFromChord = function (key, ch) {
  key = note.create(key);
  ch = chord.create(ch);

  return new Symbol(getNumeral(key, ch.root), getQuality(ch));
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

  return new Symbol(alteration + numeral, quality);
};

// Test for equality with other symbols 
Symbol.prototype.eq = function (symbol) {
  return this.interval === symbol.interval && this.quality === symbol.quality;
};

// Return the corresponding interval, e.g., bIII -> m3
Symbol.prototype.toInterval = function () {
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

// Return a new symbol transposed by the given interval
Symbol.prototype.transpose = function (interval, down) {
  var n = note.create('C').transpose(this.toInterval()).transpose(interval, down).clean();
  return new Symbol(getNumeral(note.create('C'), n), this.quality);
};

// Return a new symbol with the given quality
Symbol.prototype.withQuality = function (quality) {
  return new Symbol(this.numeral, quality);
};

Symbol.prototype.transposeDown = _.partial(Symbol.prototype.transpose, _, true);

var JzState = function (name, end) {
  this.name = name;
  this.transitions = [];
  this.sources = [];

  // True if state is an acceptable end state
  this.isEnd = !!end;
};

JzState.prototype.addEdge = function (symbol, state, edge) {
  // Don't add edge if equivalent one already exists
  if (!_.some(this[edge + 's'], function (e) {
    return e.symbol.eq(symbol) && e.state === state;
  })) {
    this[edge === 'transition' ? 'transitions' : 'sources'].push({symbol: symbol, state: state});
    state[edge === 'transition' ? 'sources' : 'transitions'].push({symbol: symbol, state: this});
  }
};

JzState.prototype.addTransition = _.partial(JzState.prototype.addEdge, _, _, 'transition');
JzState.prototype.addSource = _.partial(JzState.prototype.addEdge, _, _, 'source');

JzState.prototype.hasEdge = function (symbol, state, edge) {
  return _.some(this[edge + 's'], function (e) {
    return e.symbol.eq(symbol) && e.state === state;
  });
};

JzState.prototype.hasTransition = _.partial(JzState.prototype.hasEdge, _, _, 'transition');
JzState.prototype.hasSource = _.partial(JzState.prototype.hasEdge, _, _, 'source');

JzState.prototype.getStatesBySymbol = function (symbol, edge) {
  return _.chain(this[edge + 's'])
    .filter(function (e) {
      return e.symbol.eq(symbol);
    })
    .pluck('state')
    .value();
};

JzState.prototype.getTransitionStatesBySymbol = _.partial(JzState.prototype.getStatesBySymbol, _, 'transition');
JzState.prototype.getSourceStatesBySymbol = _.partial(JzState.prototype.getStatesBySymbol, _, 'source');

var JzA = function () {
  this.states = [];
};

JzA.prototype.addState = function (name, end) {
  var state = new JzState(name, end);
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
  });
};

JzA.prototype.getTransitionsByQuality = function (quality) {
  return _.filter(this.getTransitions(), function (t) {
    return t.symbol.quality === quality;
  });
};

JzA.prototype.getStatesByName = function (name) {
  return _.filter(this.states, function (state) {
    return state.name.toLowerCase() === name.toLowerCase();
  });
};

JzA.prototype.getStateByName = function (name) {
  return _.first(this.getStatesByName(name));
};

// Return a list of states with a given name that transition to a given state
JzA.prototype.getStatesByNameAndTransition = function (name, transition) {
  return _.filter(this.getStatesByName(name), function (s) {
    return _.contains(_.pluck(s.transitions, 'state'), transition);
  });
};

JzA.prototype.getStateByNameAndTransition = function (name, transition) {
  return _.first(this.getStatesByNameAndTransition(name, transition));
};

// Find a state with a given name that transitions to a given state, and create one if it doesn't exist
JzA.prototype.getStateWithNameAndTransition = function (name, transition, end) {
  return this.getStateByNameAndTransition(name, transition) || this.addState(name, end);
};

JzA.prototype.analyze = function (symbols) {
  // We are going to keep track of all possible pathways through the automaton
  // Since any state can be an "initial" state, start by finding all transitions for the first symbol
  var pathways = _.chain(this.getTransitionsBySymbol(_.first(symbols)))
    .map(function (transition) {
      return transition.to;
    })
    .uniq() // Eliminate duplicate first states
    .map(function (state) { // Do this after the elimination because [x] !== [x]
      return [state];
    })
    .value();
  var oldPathways;
  var nextStates;

  // With each symbol, we will construct a new list of valid pathways and then iterate
  // With each iteration, some pathways will be eliminated and others may split into multiple possibilities
  _.each(_.rest(symbols), function (symbol) {
    oldPathways = pathways;
    pathways = [];

    _.each(oldPathways, function (pathway) {
      nextStates = _.last(pathway).getTransitionStatesBySymbol(symbol);

      // If we're at a dead end, don't add this pathway
      // Otherwise, add all possible pathways we can take
      if (nextStates.length) {
        _.each(nextStates, function (nextState) {
          pathways.push(pathway.concat([nextState]));
        });
      }
    });
  });

  // Remove pathways that end in a state which is not an end state
  return _.filter(pathways, function (p) {
    return _.last(p).isEnd;
  });
};

JzA.prototype.validate = function (symbols) {
  return this.analyze(symbols).length > 0;
};

var addPrimitiveChords = function (tonic, subdominant, dominant) {
  _.each(tonicChords, function (sym) {
    dominant.addTransition(symbolFromMehegan(sym), tonic);
    tonic.addTransition(symbolFromMehegan(sym), tonic);
  });

  _.each(subdominantChords, function (sym) {
    tonic.addTransition(symbolFromMehegan(sym), subdominant);
    subdominant.addTransition(symbolFromMehegan(sym), subdominant);
  });

  _.each(dominantChords, function (sym) {
    subdominant.addTransition(symbolFromMehegan(sym), dominant);
    dominant.addTransition(symbolFromMehegan(sym), dominant);
  });
};

var addTritoneSubstitutions = function (jza) {
  // For each dominant seventh transition, add another transition with its tritone sub
  _.each(jza.getTransitionsByQuality('x'), function (t) {
    jza.addTransition(t.symbol.transpose('dim5'), t.from, t.to);
  });
};

var addUnpackedChords = function (jza) {
  var dominantSevenths = jza.getTransitionsByQuality('x');
  var minorSevenths = jza.getTransitionsByQuality('m');

  // For each dominant seventh transition, add an intermediate state for the ii to its V
  _.each(dominantSevenths, function (t) {
    // Attempt to find a pre-existing unpacked state that transitions to the same next state
    var unpackedState = jza.getStateWithNameAndTransition('Unpacked ' + t.symbol, t.to);
    unpackedState.addSource(t.symbol.transposeDown('P4').withQuality('m'), t.from);
    unpackedState.addTransition(t.symbol, t.to);
  });

  // For each minor seventh transition, add an intermediate state for the V to its ii
  _.each(minorSevenths, function (t) {
    // Attempt to find a pre-existing unpacked state that transitions to the same next state
    var unpackedState = jza.getStateWithNameAndTransition('Unpacked ' + t.symbol, t.to);
    unpackedState.addSource(t.symbol, t.from);
    unpackedState.addTransition(t.symbol.transpose('P4').withQuality('x'), t.to);
  });
};

var constructDefaultJzA = function (jza) {
  var tonic = jza.addState('Tonic', true);
  var subdominant = jza.addState('Subdominant', true);
  var dominant = jza.addState('Dominant', true);

  addPrimitiveChords(tonic, subdominant, dominant);
  addTritoneSubstitutions(jza);
  addUnpackedChords(jza);

  return jza;
};

module.exports.symbolFromChord = symbolFromChord;
module.exports.symbolFromMehegan = symbolFromMehegan;
module.exports.symbolsFromChord = _.partial(_.map, _, symbolFromChord);
module.exports.symbolsFromMehegan = _.partial(_.map, _, symbolFromMehegan);

module.exports.jza = function (type) {
  var jza = new JzA();

  if (type !== 'empty') {
    constructDefaultJzA(jza);
  }

  return jza;
};
