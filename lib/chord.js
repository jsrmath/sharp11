// chord.js

var note = require('./note');
var interval = require('./interval');
var _ = require('underscore');

// Parse a chord symbol and return root, chord, bass
var parseChordSymbol = function (chord) {
  var noteRegex = '[A-Ga-g][#b]{0,2}';
  var root = chord.match(new RegExp('^' + noteRegex))[0];
  var bass = null;
  var symbol;

  root = note.create(root);

  // Strip note, strip spaces, strip bass, default to major triad
  symbol = chord.replace(/[\s]/g, '')
                .replace(new RegExp('^' + noteRegex), '')
                .replace(new RegExp('/' + noteRegex + '$'), '');
  symbol = symbol || 'M';

  bass = chord.match(new RegExp('/' + noteRegex + '$'));
  if (bass) bass = note.create(bass[0].slice(1));

  return { root: root, symbol: symbol, bass: bass };
};

// Replace aliases in chord symbol
var handleAliases = function (symbol) {
  return symbol.replace(/maj/i, 'M')
               .replace(/min/i, 'm')
               .replace(/^-/, 'm')
               .replace(/dom/, '')
               .replace(/b/g, '-')
               .replace(/#/g, '+');
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
  if ((/^(m|dim|1\/2dim)/).test(chord)) {
    intervals[3] = 'm';  
  }
  // Chords with dim5
  if ((/(dim|-5)/).test(chord)) {
    intervals[5] = 'dim';  
  }
  // Chords with aug5
  if ((/^(aug|\+)/).test(chord) || (/[#+]5/).test(chord)) {
    intervals[5] = 'aug';  
  }
  // Chords with no 3rd
  if ((/^[5n]/).test(chord) || (/no3/).test(chord)) {
    intervals[3] = '';
  }
  // Chords with m7
  if ((/(7|9|11|13)/).test(chord)) {
    intervals[7] = 'm';  
  }
  // Chords with M7
  if ((/(M7|M9|M11|M13)/).test(chord)) {
    intervals[7] = 'M';
  }
  // Chords with dim7
  if ((/(dim7|dim9|dim11|dim13)/).test(chord) && !(/1\/2dim/).test(chord)) {
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
  if ((/\+9/).test(chord)) {
    intervals[9] = 'aug';  
  }
  if ((/-9/).test(chord)) {
    intervals[9] = 'm';  
  }
  // Special add cases
  if ((/add9/).test(chord) && !(/7/).test(chord)) {
    intervals[7] = '';  
  }
  // 11ths
  if ((/\+11/).test(chord)) {
    intervals[11] = 'aug';  
  }
  else if ((/-11/).test(chord)) {
    intervals[11] = 'dim';  
  }
  else if ((/add11/).test(chord)) {
    intervals[11] = 'P';  
  }
  else if ((/11/).test(chord)) {
    intervals[11] = 'P';
    intervals[9] = 'M';  
  }
  // 13ths
  else if ((/-13/).test(chord)) {
    intervals[13] = 'm';  
  }
  else if ((/add13/).test(chord)) {
    intervals[13] = 'M';  
  }
  else if ((/13/).test(chord)) {
    intervals[13] = 'M';
    intervals[11] = 'P';
    intervals[9] = 'M';
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

  var symbol = root.name;

  if (hasInt('M3')) {
    if (hasInt('aug5') && !(hasInt('M7') || hasInt('m7'))) {
      symbol += '+';
    }
  }
  else if (hasInt('m3')) {
    if (hasInt('dim5') && !hasInt('P5') && !hasInt('M7')) {
      if (hasInt('M6')) {
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
      symbol += '5';    
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

  if ((hasInt('M3') || hasInt('m3')) && hasInt('dim5') && !hasInt('P5') && (hasInt('M7') || hasInt('m7'))) {
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
  if ((hasInt('M3') || hasInt('m3')) && hasInt('dim5') && hasInt('P5') && (hasInt('M7') || hasInt('m7'))) {
    symbol += '#11';  
  }
  if ((hasInt('M3') || hasInt('m3')) && hasInt('m6') && hasInt('P5') && (hasInt('M7') || hasInt('m7'))) {
    symbol += 'b13';  
  }

  if (!root.enharmonic(bass)) {
    symbol += '/' + bass.name;    
  }

  // Check if symbol is not reasonable
  if (!symbol.match(/b5|#5|dim/) && !hasInt('P5')) {
    reasonable = false; // Catches most things
  }
  if ((hasInt('P5') || hasInt('dim5')) && hasInt('m3') && hasInt('m6') && !hasInt('m7') && !hasInt('M7')) {
    reasonable = false; // Catches E, G, B(b), C
  }

  return {
    symbol: symbol,
    reasonable: reasonable
  };
};

var identify = function () {
  var notes = _.map(arguments, function (n) {
    if (!note.isNote(n)) n = note.create(n);
    return n;
  });

  // Array of all possible inversions
  var inversions = _.map(notes, function (n, i) {
    var inverted = rotateArr(notes, i);
    return {
      root: n,
      bass: notes[0],
      notes: inverted.slice(1),
    }
  });

  var results = _.map(inversions, tryInversion);

  // Look for a "reasonable" result
  var reasonable = _.find(results, function (obj) {
    return obj.reasonable;
  });

  // Use reasonable result, default to root position
  var chord = reasonable ? reasonable.symbol : results[0].symbol;

  return chord;
};

// Return an array of notes in a chord
var makeChord = function (root, bass, intervals) {
  var chord = _.chain(intervals)
    .map(function (quality, number) {
      var int;
      if (quality) {
        int = interval.create(number, quality);
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
  if (bass) name += '/' + bass.name;
  return new Chord(name);
};

var Chord = function (chord) {
  var intervals;

  this.name = chord;

  chord = parseChordSymbol(chord);

  this.root = chord.root;
  this.symbol = handleAliases(chord.symbol);
  this.bass = chord.bass;

  intervals = getIntervals(this.symbol);
  this.chord = makeChord(this.root, this.bass, intervals);

  this.toString = function () {
    return this.chord.join(' ');
  };
};

Chord.prototype.transpose = function (int) {
  var root = this.root.transpose(int);
  var bass = this.bass ? this.bass.transpose(int) : null;
  return makeChordObject(root, this.symbol, bass);
};

Chord.prototype.clean = function () {
  var root = this.root.clean();
  var bass = this.bass ? this.bass.clean() : null;
  var chord = makeChordObject(root, this.symbol, bass);

  chord.chord = chord.chord.map(function (note) {
    return note.clean();
  });

  return chord;
};

module.exports.identify = identify;

module.exports.create = function (chord) {
  return new Chord(chord);
};