// note.js

var interval = require('./interval');
var assert = require('assert');
var mod = require('mod-loop');
var _ = require('underscore');

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

// Parse a note name and return object with letter, accidental
var parseName = function (name) {
  // Remove spaces
  name = name.replace(/[\s]/g, '')

  // Resolve 'x' and 's'
  name = name.replace('x', '##').replace('s', '#');

  // Throw an error for an in
  if (!(/^[A-Ga-g](bb|##|[b#n])?$/).test(name)) {
    throw new Error('Invalid note name:  ' + name);
  }

  return {
    letter:  name[0].toUpperCase(),
    acc:  name.slice(1) || 'n'
  }
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
  var distance = mod(index2 - index1 + 1, scale.length);

  assert(index1 > -1);
  assert(index2 > -1);
  assert(distance > 0 && distance <= scale.length)

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
  var key = _.findKey(map, function (val) {
    return val === int.quality;
  });

  return parseInt(key, 10);
};

// Find the offset between 
var getHalfStepOffset = function (number, halfSteps) {
  var diatonicHalfSteps = diatonicHalfSteps = getDiatonicHalfSteps(number);
  var halfStepOffset = halfSteps - diatonicHalfSteps;

  // Handle various abnormalities
  if (halfStepOffset === 11) halfStepOffset = -1;
  if (halfStepOffset === -11) halfStepOffset = 1;

  return halfStepOffset;
};

var isNote = function (note) {
  return note instanceof Note;
};

var Note = function (name) {
  name = parseName(name);

  this.letter = name.letter;
  this.acc = this.accidental = name.acc;

  // Name does not include 'n' for natural
  this.name = this.letter + (this.acc === 'n' ? '' :  this.acc);

  this.toString = function () {
    return this.name;
  };

  // Key type (# or b), null for C
  this.keyType = null;
  if (_.contains(sharpKeys, this.name)) this.keyType = '#';
  if (_.contains(flatKeys, this.name)) this.keyType =  'b';
};

// Sharp the note
Note.prototype.sharp = function () {
  // Change the accidental depending on what it is
  switch (this.acc) {
    case 'b': 
      return new Note(this.letter);
    // When sharping a double sharp, we need to go to the next letter
    case '##': 
      if (this.letter === 'B' || this.letter === 'E') { // B and E are weird
        return new Note(addNumber(this, 2) + '##');
      }
      else {
        return new Note(addNumber(this, 2) + '#');    
      }
    case 'bb': 
      return new Note(this.letter + 'b');
    default: 
      return new Note(this.name + '#');
  }
};

// Flat the note
Note.prototype.flat = function () {
  // Change the accidental depending on what it is
  switch (this.accidental) {
    case '#': 
      return new Note(this.letter);
    // When flatting a double flat, we need to go to the previous letter
    case 'bb': 
      if (this.letter === 'C' || this.letter === 'F') { // C and F are weird
        return new Note(addNumber(this, 7) + 'bb');
      }
      else {
        return new Note(addNumber(this, 7) + 'b');    
      }
    case '##': 
      return new Note(this.letter + '#');
    default: 
      return new Note(this.name + 'b');
  }    
};

// Shift the note by a given number of half steps
Note.prototype.shift = function (halfSteps) {
  var note = this;
  var func;
  var amount;

  func = halfSteps < 0 ? 'flat' : 'sharp';
  amount = Math.abs(halfSteps);

  _.range(amount).forEach(function () {
    note = note[func]();
  });

  return note;
}

// Get rid of double sharps, double flats, B#, E#, Cb, and Fb
Note.prototype.clean = function () {
  var newName = this.name;
  newName = newName.replace('B#', 'C')
  newName = newName.replace('E#', 'F')
  newName = newName.replace('Cb', 'B')
  newName = newName.replace('Fb', 'E');

  // Note: Cases like B## are handled properly, because B## becomes C#
  if (newName.slice(1) === '##') {
    newName = addNumber(this, 2);
  }
  if (newName.slice(1) === 'bb') {
    newName = addNumber(this, 7);
  }

  return new Note(newName);
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

  if (!isNote(note)) note = new Note(note);

  number = distanceBet(this.letter, note.letter);
  halfSteps = halfStepsBet(this.clean().name, note.clean().name);
  halfStepOffset = getHalfStepOffset(number, halfSteps);

  if (interval.isPerfect(number)) {
    quality = perfectOffsets[halfStepOffset];
  }
  else {
    quality = majorOffsets[halfStepOffset];
  }

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
  if (down) return this.transpose(int.invert());

  note = new Note(addNumber(this, int.number));
  halfSteps = halfStepsBet(this.clean().name, note.name);

  // Find the half step offset to the diatonic interval
  halfStepOffset = - getHalfStepOffset(int.number, halfSteps);

  // Alter it to get the interval we actually want
  halfStepOffset += getQualityOffset(int);

  assert(isFinite(halfStepOffset));

  return note.shift(halfStepOffset);
};

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
  if (!isNote(note)) note = new Note(note);

  return halfStepMap[this.clean().name] === halfStepMap[note.clean().name];
};

// Returns true if note is lower (within a C-bound octave) than the given note
Note.prototype.lowerThan = function (note) {
  var n1;
  var n2;

  if (!isNote(note)) note = new Note(note);

  n1 = this.clean();
  n2 = note.clean();

  if (n1.enharmonic(n2)) return false;

  if (n1.letter === n2.letter) {
    return accidentals.indexOf(n1.acc) < accidentals.indexOf(n2.acc)
  }

  return scale.indexOf(n1.letter) < scale.indexOf(n2.letter); 
};

// Returns true if note is higher (within a C-bound octave) than the given note
Note.prototype.higherThan = function (note) {
  if (!isNote(note)) note = new Note(note);

  return !this.enharmonic(note) && !this.lowerThan(note);
};

module.exports.isNote = isNote;

module.exports.create = function (name) {
  if (isNote(name)) return name;

  return new Note(name);
};