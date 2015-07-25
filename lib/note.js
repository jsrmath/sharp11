// note.js

var interval = require('./interval');

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

var Note = function (name) {
  name = parseName(name);

  this.letter = name.letter;
  this.acc = name.acc;

  // Name does not include 'n' for natural
  this.name = this.letter + (this.acc === 'n' ? '' : this.acc);
};

module.exports.create = function (name) {
  if (name instanceof Note) return name;

  return new Note(name);
};