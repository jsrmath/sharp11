// scale.js

var note = require('./note');
var interval = require('./interval');
var capitalize = require('capitalize');

// Supported scales and interval arrays
var scales = {
  major: ['2', '3', '4', '5', '6', '7'],
  natural_minor: ['2', 'm3', '4', '5', 'm6', 'm7'],
  harmonic_minor: ['2', 'm3', '4', '5', 'm6', '7'],
  melodic_minor: ['2', 'm3', '4', '5', '6', '7'],
  dorian: ['2', 'm3', '4', '5', '6', 'm7'],
  phrygian: ['m2', 'm3', '4', '5', 'm6', 'm7'],
  lydian: ['2', '3', 'aug4', '5', '6', '7'],
  mixolydian: ['2', '3', '4', '5', '6', 'm7'],
  locrian: ['m2', 'm3', '4', 'dim5', 'm6', 'm7'],
  whole_tone: ['2', '3', 'aug4', 'aug5', 'aug6'],
  blues: ['m3', '4', 'aug4', '5', 'm7'],
  pentatonic: ['2', '3', '5', '6'],
  minor_pentatonic: ['m3', '4', '5', 'm7'],
  diminished: ['m2', 'm3', '3', 'dim5', '5', '6', 'm7'],
  whole_half: ['2', 'm3', '4', 'dim5', 'm6', '6', '7'],
  dorian_b2: ['m2', 'm3', '4', '5', '6', 'm7'],
  lydian_augmented: ['2', '3', 'aug4', 'aug5', '6', '7'],
  lydian_dominant: ['2', '3', 'aug4', '5', '6', 'm7'],
  mixolydian_b6: ['2', '3', '4', '5', 'm6', 'm7'],
  half_diminished: ['2', 'm3', '4', 'dim5', 'm6', 'm7'],
  altered: ['m2', 'm3', 'dim4', 'dim5', 'm6', 'm7'],
  augmented: ['m3', '3', '5', 'aug5', '7'],
  bebop_dominant: ['2', '3', '4', '5', '6', 'm7', '7'],
  bebop_major: ['2', '3', '4', '5', 'm6', '6', '7'],
  bebop_minor: ['2', 'm3', '4', '5', 'm6', '6', 'm7'],
  bebop_dorian: ['2', 'm3', '3', '4', '5', '6', 'm7'],
  major_blues: ['2', 'm3', '3', '5', '6']
};

// Precedence of scales used in chord-scale mapping
var precedence = ['major', 'dorian', 'natural_minor', 'mixolydian', 'bebop_dominant', 'bebop_dorian', 'bebop_minor',
                  'harmonic_minor', 'melodic_minor', 'whole_tone', 'bebop_major', 'lydian', 'pentatonic', 'phrygian',
                  'locrian', 'altered', 'diminished', 'whole_half', 'lydian_dominant', 'lydian_augmented',
                  'half_diminished', 'dorian_b2', 'mixolydian_b6', 'minor_pentatonic', 'major_blues', 'augmented'];

var parseName = function (scaleName) {
  var scaleId;

  // Convert spaces to underscores and make lowercase.  If no scale name given, assume major
  scaleId = scaleName ? scaleName.replace(/[\s]/g, '_').toLowerCase() : 'major';

  // Scale aliases
  switch (scaleId) {
    case 'ionian':
      scaleId = 'major';
      break;
    case 'major_pentatonic':
      scaleId = 'pentatonic';
      break;
    case 'minor':
    case 'aeolian':
      scaleId = 'natural_minor';
      break;
    case 'wholetone':
      scaleId = 'whole_tone';
      break;
    case 'octatonic':
    case 'halfwhole':
    case 'half_whole':
      scaleId = 'diminished';
      break;
    case 'super_locrian':
    case 'superlocrian':
    case 'diminished_whole_tone':
    case 'diminished_wholetone':
      scaleId = 'altered';
      break;
    case 'dorian_b9':
      scaleId = 'dorian_b2';
      break;
    case 'mixolydian_b13':
      scaleId = 'mixolydian_b6';
      break;
    case 'aeolian_b5':
    case 'locrian_#2':
      scaleId = 'half_diminished';
      break;
  }

  return scaleId;
};

var Scale = function (key, scaleName, descending) {
  var intervals;
  var scaleId;

  if (!note.isNote(key)) key = note.create(key);

  scaleId = parseName(scaleName);
  intervals = scales[scaleId].concat();

  if (descending) {
    if (scaleId === 'melodic_minor') { // Melodic minor is different descending
      intervals = ['2', 'm3', '4', '5', 'm6', 'm7']; 
    }

    intervals.reverse();
  }

  // Add root
  intervals.unshift('1');

  this.scale = intervals.map(function (int) {
    return key.transpose(int);
  });

  this.intervals = intervals.map(function (int) {
    return interval.parse(int);
  });

  this.key = key;
  this.name = capitalize.words(scaleName.replace(/_/g, ' '));
  this.id = scaleId;
  this.descending = !!descending;

  this.toString = function () {
    return this.scale.join(' ');
  };
};

Scale.prototype.clean = function () {
  var scale = new Scale(this.key.clean(), this.name, this.descending);

  scale.scale = scale.scale.map(function (note) {
    return note.clean();
  });

  return scale;
};

Scale.prototype.transpose = function (interval) {
  return new Scale(this.key.transpose(interval), this.name, this.descending);
};

module.exports.scales = scales;
module.exports.precedence = precedence;

module.exports.create = function (key, scaleName, descending) {
  return new Scale(key, scaleName, descending);
};