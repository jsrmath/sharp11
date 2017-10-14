// note.js

var interval = require('./interval');
var assert = require('assert');
var mod = require('mod-loop');
var _ = require('underscore');
var random = require('random-js')();

var scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Map of note to number of half steps from C
var halfStepMap = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11,
  'C#': 1, 'Db': 1, 'D#': 3, 'Eb': 3, 'F#': 6, 'Gb': 6, 'G#': 8, 'Ab': 8, 'A#': 10, 'Bb': 10 };

// Half step offsets for major and perfect intervals
var perfectOffsets = { '-1': 'dim', '0': 'P', '1': 'aug' };
var majorOffsets = { '-2': 'dim', '-1': 'm', 0: 'M', '1': 'aug' };

var accidentals = ['b', 'n', '#'];

var sharpKeys = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
var flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

// Remove spaces and resolve double sharps from a note name
var prepareNoteName = function (name) {
  return name.replace(/[\s]/g, '').replace(/x/g, '##');
};

// Extract the first valid note name from a string
var extractNoteName = function (name) {
  var matches = prepareNoteName(name).match(/[A-Ga-g](bb|##|[b#n])?\d?/);

  return matches.length ? matches[0] : '';
};

// Parse a note name and return object with letter, accidental
var parseName = function (name) {
  var octave = null;

  name = prepareNoteName(name);

  // Extract octave number if given
  if (/\d$/.test(name)) {
    octave = parseInt(name.slice(-1));
    name = name.slice(0, -1);
  } 

  // Throw an error for an invalid note name
  if (!(/^[A-Ga-g](bb|##|[b#n])?$/).test(name)) {
    throw new Error('Invalid note name:  ' + name);
  }

  return {
    letter: name[0].toUpperCase(),
    acc: name.slice(1) || 'n',
    octave: octave
  };
};

// Increase the letter of a note by a given interval
var addNumber = function (note, number) {
  var letter = note.letter;
  var index = scale.indexOf(note.letter);
  var newIndex = mod(index + number - 1, scale.length);

  assert(index > -1);
  assert(newIndex > -1 && newIndex < scale.length);

  return scale[newIndex];
};

// Find the interval number between two notes given their letters
var distanceBet = function (letter1, letter2) {
  var index1 = scale.indexOf(letter1);
  var index2 = scale.indexOf(letter2);
  var distance = mod(index2 - index1, scale.length) + 1;

  assert(index1 > -1);
  assert(index2 > -1);
  assert(distance > 0 && distance <= scale.length);

  return distance;
};

// Find the number of half steps between two notes
var halfStepsBet = function (note1, note2) {
  return mod(halfStepMap[note2] - halfStepMap[note1], 12);
};

// Find the number of half steps to the diatonic interval given inteval number
var getDiatonicHalfSteps = function (number) {
  number = mod(number - 1, scale.length);
  return halfStepMap[scale[number]];
};

// Find the number of half steps between interval and corresponding diatonic interval
var getQualityOffset = function (int) {
  var map = interval.isPerfect(int.number) ? perfectOffsets : majorOffsets;
  var key = _.invert(map)[int.quality];

  return parseInt(key, 10);
};

// Find the offset between 
var getHalfStepOffset = function (number, halfSteps) {
  var diatonicHalfSteps = getDiatonicHalfSteps(number);
  var halfStepOffset = halfSteps - diatonicHalfSteps;

  // Handle various abnormalities
  if (halfStepOffset === 11) halfStepOffset = -1;
  if (halfStepOffset === -11) halfStepOffset = 1;

  return halfStepOffset;
};

var isNote = function (note) {
  return note instanceof Note;
};

var Note = function (name, octave) {
  name = parseName(name);

  this.letter = name.letter;
  this.acc = this.accidental = name.acc;
  this.octave = octave || name.octave;

  // Disallow octaves below 0 or above 9
  if (this.octave && this.octave < 0 || this.octave > 9) {
    throw new Error('Invalid octave number: ' + octave);
  }

  // Name does not include 'n' for natural
  this.name = this.letter + (this.acc === 'n' ? '' :  this.acc);

  this.fullName = this.octave ? this.name + this.octave : this.name;

  this.toString = function () {
    return this.fullName;
  };

  // Key type (# or b), null for C
  this.keyType = null;
  if (_.contains(sharpKeys, this.name)) this.keyType = '#';
  if (_.contains(flatKeys, this.name)) this.keyType =  'b';
};

var createNote = function (note, octave) {
  if (isNote(note)) return new Note(note.name, octave || note.octave);

  return new Note(note, octave);
};

// An integer value representing the note, if an octave number is given
Note.prototype.value = function () {
  if (this.octave) {
    return (this.clean().octave + 1) * 12 + createNote('C').getHalfSteps(this);
  }

  return null;
};

// Sharp the note
Note.prototype.sharp = function () {
  var octave = this.octave;

  // Change the accidental depending on what it is
  switch (this.acc) {
    case 'b': 
      return new Note(this.letter, octave);
    // When sharping a double sharp, we need to go to the next letter
    case '##': 
      // B## requires octave increase
      if (octave && this.letter === 'B') octave += 1;

      if (this.letter === 'B' || this.letter === 'E') { // B and E are weird
        return new Note(addNumber(this, 2) + '##', octave);
      }
      else {
        return new Note(addNumber(this, 2) + '#', octave);    
      }
      break;
    case 'bb': 
      return new Note(this.letter + 'b', octave);
    default: 
      return new Note(this.name + '#', octave);
  }
};

// Flat the note
Note.prototype.flat = function () {
  var octave = this.octave;

  // Change the accidental depending on what it is
  switch (this.accidental) {
    case '#': 
      return new Note(this.letter, octave);
    // When flatting a double flat, we need to go to the previous letter
    case 'bb': 
      // Cbb requires octave decrease
      if (octave && this.letter === 'C') octave -= 1;

      if (this.letter === 'C' || this.letter === 'F') { // C and F are weird
        return new Note(addNumber(this, 7) + 'bb', octave);
      }
      else {
        return new Note(addNumber(this, 7) + 'b', octave);    
      }
      break;
    case '##': 
      return new Note(this.letter + '#', octave);
    default: 
      return new Note(this.name + 'b', octave);
  }    
};

// Shift the note by a given number of half steps
Note.prototype.shift = function (halfSteps) {
  var note = this;
  var func;
  var amount;

  func = halfSteps < 0 ? 'flat' : 'sharp';
  amount = Math.abs(halfSteps);

  _.times(amount, function () {
    note = note[func]();
  });

  return note;
};

// Get rid of double sharps, double flats, B#, E#, Cb, and Fb
Note.prototype.clean = function () {
  var octave = this.octave;
  var newName = this.name;

  // Handle octave switch for B#(#) and Cb(B)
  if (octave) {
    if (this.name.slice(0, 2) === 'B#') octave += 1;
    if (this.name.slice(0, 2) === 'Cb') octave -= 1;
  }

  newName = newName.replace('B#', 'C');
  newName = newName.replace('E#', 'F');
  newName = newName.replace('Cb', 'B');
  newName = newName.replace('Fb', 'E');

  // Note: Cases like B## are handled properly, because B## becomes C#
  if (newName.slice(1) === '##') {
    newName = addNumber(this, 2);
  }
  if (newName.slice(1) === 'bb') {
    newName = addNumber(this, 7);
  }

  return new Note(newName, octave);
};

// Rerturn the note with a given accidental (# or b), if possible
Note.prototype.withAccidental = function (acc) {
  var note = this;
  var possibilities = [this.clean(), this.clean().toggleAccidental()];

  _.each(possibilities, function (possibility) {
    if (possibility.acc === acc) note = possibility;
  });

  return note;
};

// Return the note in a given octave
Note.prototype.inOctave = function (octave) {
  return createNote(this, octave);
};

// Return the interval to a given note object or string name
Note.prototype.getInterval = function (note) {
  var number;
  var quality;
  var halfSteps;

  // Difference in number of half steps between interval and diatonicHalfSteps
  var halfStepOffset;

  // If the note that is being raised is a double accidental, throw an error
  // It's theoretically possible but it gets messy
  if (this.accidental === 'bb' || this.accidental === '##') {
    throw new Error('Can\'t use double sharp or double flat as base key.');
  }

  note = createNote(note);

  number = distanceBet(this.letter, note.letter);
  halfSteps = halfStepsBet(this.clean().name, note.clean().name);
  halfStepOffset = getHalfStepOffset(number, halfSteps);

  if (interval.isPerfect(number)) {
    quality = perfectOffsets[halfStepOffset];
  }
  else {
    quality = majorOffsets[halfStepOffset];
  }

  if (!quality) throw new Error('Invalid interval');

  return interval.create(number, quality);
};

Note.prototype.transpose = function (int, down) {
  // A note that is the proper number away, ignoring quality
  var note;

  // The number of half steps between the given note and that note
  var halfSteps;

  // The number of half steps between that note and the proper note
  var halfStepOffset;

  // If the note that is being raised is a double accidental, throw an error
  // It's theoretically possible but it gets messy
  if (this.accidental === 'bb' || this.accidental === '##') {
    throw new Error('Can\'t use double sharp or double flat as base key.');
  }

  int = interval.parse(int);

  // Transposing down is the same as transposing up by inverted interval
  if (down) int = int.invert();

  note = new Note(addNumber(this, int.number), this.octave);
  halfSteps = halfStepsBet(this.clean().name, note.name);

  // Find the half step offset to the diatonic interval
  halfStepOffset = - getHalfStepOffset(int.number, halfSteps);

  // Alter it to get the interval we actually want
  halfStepOffset += getQualityOffset(int);
  assert(isFinite(halfStepOffset));
  note = note.shift(halfStepOffset);

  // Handle octave numbers
  if (note.octave) {
    if (down) {
      if (this.lowerThan(note)) note = note.inOctave(note.octave - 1);
      if (int.number > 7) note = note.inOctave(note.octave - 1);
    }
    else {
      if (this.higherThan(note)) note = note.inOctave(note.octave + 1);
      if (int.number > 7) note = note.inOctave(note.octave + 1);
    }
  }

  return note;
};

Note.prototype.transposeDown = _.partial(Note.prototype.transpose, _, true);

// Changes sharp to flat, flat to sharp
Note.prototype.toggleAccidental = function () {
  if (this.acc === '#') {
    return this.transpose('dim2');    
  }
  else if (this.acc === 'b') {
    return this.transpose('aug7');    
  }
  else {
    return this.clean();    
  }
};

// Return true if current note is enharmonic with a given note
Note.prototype.enharmonic = function (note) {
  note = createNote(note);

  return halfStepMap[this.clean().name] === halfStepMap[note.clean().name];
};

// Returns true if note is lower (within a C-bound octave) than the given note
Note.prototype.lowerThan = function (note) {
  note = createNote(note);

  // Handle octave numbers
  if (this.octave && note.octave) {
    if (this.octave < note.octave) return true;
    if (this.octave > note.octave) return false;
  }

  if (this.enharmonic(note)) return false;

  if (this.letter === note.letter) {
    return accidentals.indexOf(this.acc) < accidentals.indexOf(note.acc);
  }

  return scale.indexOf(this.letter) < scale.indexOf(note.letter); 
};

// Returns true if note is higher (within a C-bound octave) than the given note
Note.prototype.higherThan = function (note) {
  var sameNote;

  note = createNote(note);

  sameNote = this.enharmonic(note);
  sameNote = sameNote && (!this.octave || !note.octave || this.octave === note.octave);

  return !sameNote && !this.lowerThan(note);
};

// Returns true if two notes are the same, taking into account octave numbers if both notes have them
Note.prototype.equals = Note.prototype.eq = function (note) {
  note = createNote(note);

  if (this.octave && note.octave) return this.fullName === note.fullName;

  return this.name === note.name;
};

// Get the number of half steps between two notes
Note.prototype.getHalfSteps = function (note) {
  var n1;
  var n2;

  note = createNote(note);

  n1 = this.clean();
  n2 = note.clean();

  try {
    return n1.getInterval(n2).halfSteps();
  }
  catch (e1) {
    try {
      return n1.toggleAccidental().getInterval(n2).halfSteps();
    }
    catch (e2) {
      return n1.getInterval(n2.toggleAccidental()).halfSteps();
    }
  }
};

// Return true if note is in a given array of notes, matching octave numbers if applicable
Note.prototype.containedIn = function (arr) {
  return _.some(arr, function (note) {
    if (note.enharmonic(this)) {
      return !note.octave || !this.octave || note.octave === this.octave;
    }
  }, this);
};

// Return true if note is in a specified range, inclusive
Note.prototype.inRange = function (range) {
  return !this.lowerThan(range[0]) && !this.higherThan(range[1]);
};

// Return a random note between two bounds
module.exports.random = function (range) {
  var note;

  lower = createNote(range[0]);
  upper = createNote(range[1]);

  if (!lower.octave || !upper.octave) {
    throw new Error('Given range must have octave numbers');
  }

  if (lower.enharmonic(upper) && lower.octave === upper.octave) {
    return lower;
  }
  else if (!lower.lowerThan(upper)) {
    throw new Error('Lower bound must be lower than upper bound');
  }

  do {
    note = new Note('C').shift(random.integer(0, 11)).clean();
    note = note.inOctave(random.integer(lower.octave, upper.octave));
  } while (!note.inRange([lower, upper]));

  return note;
};

module.exports.isNote = isNote;
module.exports.create = createNote;
module.exports.Note = Note;

module.exports.fromValue = function (value) {
  return createNote('C', Math.floor(value / 12) - 1).shift(value % 12).clean();
};

module.exports.extract = function (str) {
  return createNote(extractNoteName(str));
};
