// note.js

var interval = require('./interval');
var assert = require('assert');
var mod = require('mod-loop');

var scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Map of note to number of half steps from C
var halfStepMap = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11,
  'C#': 1, 'Db': 1, 'D#': 3, 'Eb': 3, 'F#': 6, 'Gb': 6, 'G#': 8, 'Ab': 8, 'A#': 10, 'Bb': 10 };

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

// Half step offsets for major and perfect intervals
var perfectOffsets = ['dim', 'P', 'aug'];
var majorOffsets = ['dim', 'm', 'M', 'aug'];

// The above offsets are themselves offset, because array indices start at 0
// Adding the half step offset to the index offset will get you the proper
// index in the above array
var perfectIndexOffset = 1;
var majorIndexOffset = 2;

// Increase the letter of a note by a given interval
var addNumber = function (note, number) {
  var letter = note.letter;
  var index = scale.indexOf(note.letter);
  var newIndex = mod(index + number - 1, scale.length);

  assert(index > -1);
  assert(newIndex > -1 && newIndex < scale.length);

  return scale[newIndex];
};

var distanceBet = function (letter1, letter2) {
  var index1 = scale.indexOf(letter1);
  var index2 = scale.indexOf(letter2);
  var distance = mod(index2 - index1 + 1, scale.length);

  assert(index1 > -1);
  assert(index2 > -1);
  assert(distance > 0 && distance <= scale.length)

  return distance;
};

var halfStepsBet = function (note1, note2) {
  return mod(halfStepMap[note2] - halfStepMap[note1], 12);
};

var Note = function (name) {
  name = parseName(name);

  this.letter = name.letter;
  this.acc = this.accidental = name.acc;

  // Name does not include 'n' for natural
  this.name = this.letter + (this.acc === 'n' ? '' :  this.acc);
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

// Get rid of double sharps, double flats, B#, E#, Cb, and Fb
Note.prototype.clean = function () {
  var newName = this.name;
  newName = newName.replace('B#', 'C')
  newName = newName.replace('E#', 'F')
  newName = newName.replace('Cb', 'B')
  newName = newName.replace('Fb', 'E');

  // Note:  Cases like B## are handled properly, because B## becomes C#
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

  // Number of half steps in the corresponding major/perfect interval
  var diatonicHalfSteps;

  // Difference in number of half steps between interval and diatonicHalfSteps
  var halfStepOffset;

  // If the note that is being raised is a double accidental, throw an error
  // It's theoretically possible but it gets messy
  if (this.accidental === 'bb' || this.accidental === '##') {
    throw new Error('Can\'t use double sharp or double flat as base key.');
  }

  if (!(note instanceof Note)) {
    note = new Note(note);
  }

  number = distanceBet(this.letter, note.letter);
  halfSteps = halfStepsBet(this.clean().name, note.clean().name);
  diatonicHalfSteps = halfStepMap[scale[number - 1]];
  halfStepOffset = halfSteps - diatonicHalfSteps;
  
  // Handle various abnormalities
  if (halfStepOffset === 11) halfStepOffset = -1;
  if (halfStepOffset === -11) halfStepOffset = 1;

  if (interval.isPerfect(number)) {
    quality = perfectOffsets[halfStepOffset + perfectIndexOffset];
  }
  else {
    quality = majorOffsets[halfStepOffset + majorIndexOffset];
  }

  return interval.create(number, quality);
};

module.exports.create = function (name) {
  if (name instanceof Note) return name;

  return new Note(name);
};