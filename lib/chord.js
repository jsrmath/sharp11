// chord.js

var note = require('./note');
var interval = require('./interval');
var scale = require('./scale');
var midi = require('./midi');
var _ = require('underscore');

// Parse a chord symbol and return root, chord, bass
var parseChordSymbol = function (chord) {
  var noteRegex = '[A-Ga-g][#b]{0,2}';
  var root = chord.match(new RegExp('^' + noteRegex))[0];
  var bass = null;
  var symbol;

  root = note.create(root);

  // Strip note, strip spaces, strip bass
  symbol = chord.replace(/[\s]/g, '')
                .replace(new RegExp('^' + noteRegex), '')
                .replace(new RegExp('/' + noteRegex + '$'), '');

  bass = chord.match(new RegExp('/' + noteRegex + '$'));
  if (bass) bass = note.create(bass[0].slice(1));

  return { root: root, symbol: symbol, bass: bass };
};

// Replace aliases in chord symbol
var handleAliases = function (symbol) {
  var parentheticals;

  if (symbol === '') return 'M'; // No symbol means major triad

  symbol = symbol.replace(/maj/i, 'M')
                 .replace(/∆/, 'M')
                 .replace(/min/i, 'm')
                 .replace(/^-/, 'm')
                 .replace(/dom/, '')
                 .replace(/^o/, 'dim')
                 .replace(/1\/2dim/, 'ø');

  // Remove parentheses unless they are significant, i.e. they contain an 11, or 13
  parentheticals = symbol.match(/\([^\)]*\)/g);
  _.each(parentheticals, function (parenthetical) {
    if (parenthetical.indexOf('11') === -1 && parenthetical.indexOf('13') === -1) {
      symbol = symbol.replace(parenthetical, parenthetical.slice(1, -1));
    }
  });

  return symbol;
};

// Rotate an array so that the given index is first
var rotateArr = function (arr, index) {
  return arr.slice(index).concat(arr.slice(0, index));
};

// Given a chord symbol, return array of interval qualities
var getIntervals = function (chord) {
  var intervals = [];

  // Assume P1, M3. and P5
  intervals[1] = 'P';
  intervals[3] = 'M';
  intervals[5] = 'P';

  // Chords with m3
  if ((/^(m|dim|ø)/).test(chord)) {
    intervals[3] = 'm';  
  }
  // Chords with dim5
  if ((/(dim|ø|[-b]5)/).test(chord)) {
    intervals[5] = 'dim';  
  }
  // Chords with aug5
  if ((/^(aug|\+)/).test(chord) || (/[+#]5/).test(chord)) {
    intervals[5] = 'aug';  
  }
  // Chord with no 5th
  if ((/no5/).test(chord)) {
    intervals[5] = '';
  }
  // Chords with no 3rd
  else if ((/^[5n]/).test(chord) || (/no3/).test(chord)) {
    intervals[3] = '';
  }
  // Chords with m7
  if ((/(ø|7|9|11|13)/).test(chord)) {
    intervals[7] = 'm';  
  }
  // Chords with M7
  if ((/(M7|M9|M11|M13)/).test(chord)) {
    intervals[7] = 'M';
  }
  // Chords with dim7
  if ((/(dim7|dim9|dim11|dim13)/).test(chord)) {
    intervals[7] = 'dim';
  }
  // 6ths
  if ((/6/).test(chord)) {
    intervals[6] = 'M';
    intervals[7] = '';
  }
  // Suspended 2
  if ((/sus2/).test(chord)) {
    intervals[2] = 'M';
    intervals[3] = '';
  }
  // Suspended 4
  else if ((/sus/).test(chord)) {
    intervals[4] = 'P';
    intervals[3] = '';
  }
  // 9ths
  if ((/9/).test(chord)) {
    intervals[9] = 'M';  
  }
  if ((/[+#]9/).test(chord)) {
    intervals[9] = '';  
    intervals[10] = 'm'; // Store #9 as b10 to allow for b9#9
  }
  if ((/[-b]9/).test(chord)) {
    intervals[9] = 'm';  
  }
  if ((/add9/).test(chord)) {
    if (!(/7/).test(chord)) intervals[7] = '';
  }
  // 11ths
  if ((/[+#]11/).test(chord)) {
    intervals[11] = 'aug';  
  }
  else if ((/[-b]11/).test(chord)) {
    intervals[11] = 'dim';  
  }
  else if ((/add11/).test(chord) || (/\([^\)]*11[^\)]*\)/).test(chord)) {
    intervals[11] = 'P';
    if ((/add11/).test(chord) && !(/7|9/).test(chord)) {
      intervals[7] = '';
    }
  }
  else if ((/11/).test(chord)) {
    intervals[11] = 'P';
    intervals[9] = intervals[9] || 'M';  
  }
  // 13ths
  if ((/[-b]13/).test(chord)) {
    intervals[13] = 'm';  
  }
  else if ((/add13/).test(chord) || (/\([^\)]*13[^\)]*\)/).test(chord)) {
    intervals[13] = 'M';
    if ((/add13/).test(chord) && !(/7|9|11/).test(chord)) {
      intervals[7] = '';
    }
  }
  else if ((/13/).test(chord)) {
    intervals[13] = 'M';
    intervals[11] = intervals[11] || 'P';
    intervals[9] = intervals[9] || 'M';
  }
  // Exclude 9th or 11th
  if ((/no9/).test(chord)) {
    intervals[9] = '';
  }
  // Exclude 9th or 11th
  if ((/no11/).test(chord)) {
    intervals[11] = '';
  }

  return intervals;
};

var tryInversion = function (inversion) {
  var root = inversion.root;
  var bass = inversion.bass;
  var notes = inversion.notes;

  // We designate an inversion "reasonable" if we think it is
  // likely to be the correct inversion (default to true)
  var reasonable = true;

  // Return true if interval is present in this chord
  var hasInt = function (interval) {
    return _.find(notes, function (n) {
      return root.transpose(interval).enharmonic(n);
    });
  };

  var symbol = '';

  var noThird = false;

  if (hasInt('M3')) {
    if (hasInt('aug5') && !(hasInt('M7') || hasInt('m7'))) {
      symbol += '+';
    }
  }
  else if (hasInt('m3')) {
    if (hasInt('dim5') && !hasInt('P5') && !hasInt('M7')) {
      if (hasInt('dim7') && !hasInt('m7')) {
        symbol += 'dim7';  
      }
      else if (hasInt('m7')) {
        symbol += 'm';  
      }
      else {
        symbol += 'dim';  
      }
    }
    else {
      symbol += 'm';    
    }
  }
  else {
    if (hasInt('P4')) {
      symbol += 'sus4';
    }
    else if (hasInt('M2')) {
      symbol += 'sus2';    
    }
    else {
      noThird = true;  
    }
  }

  if (hasInt('M7') || hasInt('m7')) {
    if (hasInt('M7')) {
      symbol += 'M';    
    }
    if (hasInt('M6')) {
      symbol += '13';    
    }
    else if (hasInt('P4') && (hasInt('M3') || hasInt('m3'))) {
      symbol += '11';    
    }
    else if (hasInt('M2') && (hasInt('M3') || hasInt('m3'))) {
      symbol += '9';    
    }
    else {
      symbol += '7';
    }
  }
  else if (hasInt('M3') || hasInt('m3')) {
    if (hasInt('M6') && !hasInt('dim5')) {
      symbol += '6';
      if (hasInt('M2')) {
        symbol += '/9';  
      }
    }
    if (hasInt('P4')) {
      symbol += 'add11';    
    }
    if (!hasInt('M6') && hasInt('M2')) {
      symbol += 'add9';    
    }
  }

  if ((hasInt('M3') || hasInt('m3')) && hasInt('dim5') && !(hasInt('P5') || hasInt('aug5')) && (hasInt('M7') || hasInt('m7'))) {
    symbol += 'b5';
  }
  if (hasInt('M3') && hasInt('aug5') && !hasInt('P5') && (hasInt('M7') || hasInt('m7'))) {
    symbol += '#5';
  }
  if (hasInt('m2')) {
    symbol += 'b9';  
  }
  if (hasInt('M3') && hasInt('aug2')) {
    symbol += '#9';  
  }
  if ((hasInt('M3') || hasInt('m3')) && hasInt('dim5') && (hasInt('P5') || hasInt('aug5')) && (hasInt('M7') || hasInt('m7'))) {
    symbol += '#11';  
  }
  if ((hasInt('M3') || hasInt('m3')) && hasInt('m6') && hasInt('P5') && (hasInt('M7') || hasInt('m7'))) {
    symbol += 'b13';  
  }

  if (noThird) {
    if (symbol === '') {
      symbol = '5';
    }
    else {
      symbol += 'no3';
    }
  }

  if (!root.enharmonic(bass)) {
    symbol += '/' + bass.name;    
  }

  // Check if symbol is not reasonable
  if (!symbol.match(/b5|#5|dim/) && !hasInt('P5')) {
    reasonable = false; // Catches most things
  }
  if ((hasInt('P5') || hasInt('dim5')) && hasInt('m3') && hasInt('m6')) {
    reasonable = false; // Catches E, G, B(b), C
  }
  if (symbol.match(/6add11/)) {
    reasonable = false; // Catches G, B(b), C, D, E 
  }

  return {
    symbol: root.name + symbol,
    reasonable: reasonable
  };
};

var getPossibleChords = function () {
  var notes = _.map(arguments, function (n) {
    return note.create(n);
  });

  // Array of all possible inversions
  var inversions = _.map(notes, function (n, i) {
    var inverted = rotateArr(notes, i);
    return {
      root: n,
      bass: notes[0],
      notes: inverted.slice(1),
    };
  });

  return _.chain(inversions)
    .map(tryInversion)
    .sortBy(function (r) {
      return r.reasonable ? 0 : 1;
    })
    .uniq(false, function (r) {
      return r.symbol;
    })
    .value();
}

var getPossibleChordNames = function () {
  return getPossibleChords
    .apply(this, arguments)
    .map(function (n) {
      return n.symbol
    });
};

var getPossibleChordNamesFromArray = function (arr) {
  return getPossibleChordNames.apply(this, arr);
};

var identify = function () {
  var results = getPossibleChords.apply(this, arguments);

  // Look for a "reasonable" result
  var reasonable = _.find(results, function (obj) {
    return obj.reasonable;
  });

  // Use reasonable result, default to root position
  var chord = reasonable ? reasonable.symbol : (results[0] || {}).symbol;

  return chord;
};

var identifyArray = function (arr) {
  return identify.apply(this, arr);
};

// Return an array of notes in a chord
var makeChord = function (root, bass, intervals) {
  var chord = _.chain(intervals)
    .map(function (quality, number) {
      var int;
      if (quality) {
        // #9 is stored as b10, so special case this
        if (number === 10 && quality === 'm') {
          int = interval.create(9, 'aug');
        }
        else {
          int = interval.create(number, quality);
        }
        return root.transpose(int);
      }
    })
    .compact()
    .value();

  var bassIndex;

  // Handle slash chords
  if (bass && !root.enharmonic(bass)) {
    bassIndex = _.findIndex(chord, bass.enharmonic.bind(bass));

    if (bassIndex > -1) { // Rotate chord so bass is first
      chord = rotateArr(chord, bassIndex);
    }
    else { // Otherwise, add bass to beginning
      chord.unshift(bass);
    }
  }

  return chord;
};

// Make a chord object given root, symbol, bass
var makeChordObject = function (root, symbol, bass) {
  var name = root.name + symbol;
  var octave = bass ? bass.octave : root.octave;

  if (bass) name += '/' + bass.name;
  return new Chord(name, octave);
};

// Given an ordered list of scales and a chord symbol, optimize order
var optimizeScalePrecedence = function (scales, chord) {
  // Exclude scales with a particular interval
  var exclude = function (int) {
    scales = _.filter(scales, function (scale) {
      return !scale.hasInterval(int);
    });
  };

  // Add a scale at a particular index
  var include = function (index, scaleId) {
    scales.splice(index, 0, scale.create(chord.root, scaleId));
  };

  if (_.includes(['m', 'm6', 'm7', 'm9', 'm11', 'm13'], chord.formattedSymbol)) {
    exclude('M3');
  }
  if (_.includes(['7', '9', '11', '13', 'm7', 'm9', 'm11', 'm13'], chord.formattedSymbol)) {
    exclude('M7');
  }
  if (_.includes(['M7', 'M9', 'M11', 'M13'], chord.formattedSymbol)) {
    exclude('m7');
  }
  if (chord.formattedSymbol[0] === '6' || chord.formattedSymbol.slice(0, 2) === 'M6') {
    exclude('m7');
  }

  if (_.includes(['7', '7#9', '7+9', '7#11', '7+11'], chord.formattedSymbol)) {
    include(2, 'blues');
  }

  return scales;
};

// Given a chord object and an octave number, assign appropriate octave numbers to notes
var setOctave = function (obj, octave) {
  var lastNote = obj.chord[0];

  obj.chord = _.map(obj.chord, function (n) {
    // Every time a note is "lower" than the last note, we're in a new octave
    if (n.lowerThan(lastNote)) octave += 1;

    // As a side-effect, update the octaves for root and bass
    if (n.enharmonic(obj.root)) {
      obj.root = obj.root.inOctave(octave);
    }
    if (obj.bass && n.enharmonic(obj.bass)) {
      obj.bass = obj.bass.inOctave(octave);
    }

    lastNote = n;
    return n.inOctave(octave);
  });
};

var Chord = function (chord, octave) {
  var intervals;

  this.name = chord;

  chord = parseChordSymbol(chord);

  this.root = chord.root;
  this.symbol = chord.symbol;
  this.formattedSymbol = handleAliases(chord.symbol);
  this.bass = chord.bass;

  intervals = getIntervals(this.formattedSymbol);
  this.chord = makeChord(this.root, this.bass, intervals);

  this.octave = null;
  if (octave) {
    this.octave = octave;
    setOctave(this, octave);
  }

  this.toString = function () {
    return this.chord.join(' ');
  };
};

var createChord = function (chord, octave) {
  if (chord instanceof Chord) return new Chord(chord.name, chord.octave || octave);

  return new Chord(chord, octave);
};

// Return a list of scales that match chord, in order of precedence
Chord.prototype.scales = function () {
  var root = note.create(this.root.name); // Remove octave number
  var chord = this.chord;

  var scales = _.map(scale.precedence, function (name) {
    return scale.create(root, name);
  });

  scales = _.filter(scales, function (scale) {
    return _.every(chord, scale.contains.bind(scale));
  });

  return optimizeScalePrecedence(scales, this);
};

// Return highest precedence scale that matches chord
Chord.prototype.scale = function () {
  return this.scales()[0];
};

// Return a list of scale names that match chord, in order of precedence
Chord.prototype.scaleNames = function () {
  return _.pluck(this.scales(), 'name');
};

Chord.prototype.transpose = function (int, down) {
  var root = this.root.transpose(int, down);
  var bass = this.bass ? this.bass.transpose(int, down) : null;
  return makeChordObject(root, this.symbol, bass);
};

Chord.prototype.transposeDown = _.partial(Chord.prototype.transpose, _, true);

Chord.prototype.clean = function () {
  var root = this.root.clean();
  var bass = this.bass ? this.bass.clean() : null;
  var chord = makeChordObject(root, this.symbol, bass);

  chord.chord = _.map(chord.chord, function (note) {
    return note.clean();
  });

  return chord;
};

// Return true if a given note is in a chord, matching octave numbers if applicable
Chord.prototype.contains = function (n) {
  return note.create(n).containedIn(this.chord);
};

// Return true if a given interval is in a chord, matching octave numbers if applicable
Chord.prototype.hasInterval = function (int) {
  return note.create(this.root).transpose(int).containedIn(this.chord);
};

Chord.prototype.inOctave = function (octave) {
  return new Chord(this.name, octave);
};

module.exports.isChord = function (chord) {
  return chord instanceof Chord;
};

module.exports.identify = identify;
module.exports.identifyArray = identifyArray;
module.exports.getPossibleChordNames = getPossibleChordNames;
module.exports.getPossibleChordNamesFromArray = getPossibleChordNamesFromArray;
module.exports.create = createChord;
module.exports.Chord = Chord;
