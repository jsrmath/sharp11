// note.js

var interval = require('./interval');
var assert = require('assert');

var cScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Parse a note name and return object with letter, accidental
var parseName = function (name) {
  // Remove spaces
  name = name.replace(/[\s]/g, '')

  // Resolve 'x' and 's'
  name = name.replace('x', '##').replace('s', '#');

  // Throw an error for an in
  if (!(/^[A-Ga-g](bb|##|[b#n])?$/).test(name)) {
    throw new Error('Invalid note name: ' + name);
  }

  return {
    letter: name[0].toUpperCase(),
    acc: name.slice(1) || 'n'
  }
};

// Increase the letter of a note by a given interval
var addNumber = function (note, number) {
  var letter = note.letter;
  var index = cScale.indexOf(note.letter);
  var newIndex = (index + number - 1) % cScale.length;

  assert(index > -1);
  assert(newIndex > -1 && newIndex < cScale.length);

  return cScale[newIndex];
};

var Note = function (name) {
  name = parseName(name);

  this.letter = name.letter;
  this.acc = this.accidental = name.acc;

  // Name does not include 'n' for natural
  this.name = this.letter + (this.acc === 'n' ? '' : this.acc);
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

  // Note: Cases like B## are handled properly, because B## becomes C#
  if (newName.slice(1) === '##') {
    newName = addNumber(this, 2);
  }
  if (newName.slice(1) === 'bb') {
    newName = addNumber(this, 7);
  }

  return new Note(newName);
};

module.exports.create = function (name) {
  if (name instanceof Note) return name;

  return new Note(name);
};