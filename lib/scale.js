// scale.js

var note = require('./note');
var interval = require('./interval');
var capitalize = require('capitalize');
var _ = require('underscore');
var mod = require('mod-loop');

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
                  'half_diminished', 'dorian_b2', 'mixolydian_b6', 'minor_pentatonic', 'major_blues'];

var parseName = function (scaleName) {
  var scaleId;

  // Convert spaces to underscores and make lowercase.  If no scale name given, assume major
  scaleId = scaleName.replace(/[\s]/g, '_').toLowerCase();

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

// Return index of note in scale
var findIndex = function (scale, note) {
  return _.findIndex(scale.scale, function (scaleNote) {
    return scaleNote.enharmonic(note);
  });
};

var Scale = function (key, scaleName) {
  var intervals;
  var scaleId;

  key = note.create(key);

  scaleName = scaleName || 'Major';
  scaleId = parseName(scaleName);
  intervals = scales[scaleId].concat();


  // Add root
  intervals.unshift('1');

  this.scale = _.map(intervals, function (int) {
    return key.transpose(int);
  });

  this.intervals = _.map(intervals, function (int) {
    return interval.parse(int);
  });

  this.key = this.root = key;
  this.name = capitalize.words(scaleName.replace(/_/g, ' ')).replace(/B(\d)/, 'b$1');
  this.id = scaleId;
  this.fullName = this.key.name + ' ' + this.name;
  this.octave = this.root.octave;

  this.toString = function () {
    return this.scale.join(' ');
  };
};

Scale.prototype.descending = function () {
  var scale = this.scale.concat();
  var root;

  // Melodic minor is the same as natural minor when descending
  if (this.id === 'melodic_minor') {
    scale = new Scale(this.key, 'natural_minor').scale.concat();
  }

  root = scale.shift();
  scale.reverse();

  // Fix octave numbers
  return [root].concat(_.map(scale, function (note) {
    return note.transpose('P8', true);
  }));
};

Scale.prototype.clean = function () {
  var scale = new Scale(this.key.clean(), this.name);

  scale.scale = _.map(scale.scale, function (note) {
    return note.clean();
  });

  return scale;
};

Scale.prototype.transpose = function (int, down) {
  return new Scale(this.key.transpose(int, down), this.name);
};

Scale.prototype.inOctave = function (octave) {
  return new Scale(this.key.inOctave(octave), this.name);
};

Scale.prototype.transposeDown = _.partial(Scale.prototype.transpose, _, true);

Scale.prototype.nearest = function (n) {
  var nearest;

  // Ensure n is a note and strip octave number
  n = note.create(n);

  // Find the note such that the interval to the given note has the fewest number of half steps
  nearest = _.chain(this.scale)
    .map(function (scaleNote) {
      var halfSteps = n.getHalfSteps(scaleNote);

      return {
        note: scaleNote,
        halfSteps: Math.min(halfSteps, 12 - halfSteps)
      };
    })
    .sortBy('halfSteps')
    .value()[0].note;

  // If scale doesn't have octave numbers but `n` does, assign octave number to `nearest`
  if (n.octave && !nearest.octave) {
    nearest = note.create(nearest, n.octave);

    // Check that we're not off by one
    if (_.contains(['C', 'D'], n.name) && _.contains(['A', 'B'], nearest.name)) {
      nearest = nearest.transposeDown('P8');
    }
    if (_.contains(['C', 'D'], nearest.name) && _.contains(['A', 'B'], n.name)) {
      nearest = nearest.transpose('P8');
    }
  }

  return nearest;
};

// Return true if a given note is in a scale, matching octave numbers if applicable
Scale.prototype.contains = function (n) {
  return note.create(n).containedIn(this.scale);
};

// Return true if a given interval is in a scale, matching octave numbers if applicable
Scale.prototype.hasInterval = function (int) {
  return note.create(this.root).transpose(int).containedIn(this.scale);
};

// Return a TraversableScale object with scale and given note
Scale.prototype.traverse = function (current) {
  var octave;
  var index;

  current = note.create(current);

  if (!current.octave) throw new Error('Traversable scale must be initialized with octave number');

  // Scale root octave is either the same or one lower than current note's octave
  // Using scale.root.name removes octave number from scale.root
  octave = current.lowerThan(this.root.name) ? current.octave - 1 : current.octave;

  index = findIndex(this, current);
  if (index === -1) throw new Error('Scale does not contain note: ' + current);

  return new TraversableScale(this, index, octave);
};

var TraversableScale = function (scale, index, octave) {
  // Initialize scale in proper octave
  this.scale = new Scale(scale.root.name + octave, scale.name);

  this.index = index;
  this.octave = octave;
  this.length = scale.scale.length;

  this.name = this.scale.name;
  this.id = this.scale.id;
  this.fullName = this.scale.fullName;

  this.current = function () {
    return this.scale.scale[this.index];
  };

  this.toString = function () {
    var regex = new RegExp('(' + this.current() + ')');
    return this.scale.toString().replace(regex, '[$1]');
  };
};

TraversableScale.prototype.clean = function () {
  var scale = this.scale.traverse(this.current().clean());
  scale.scale = scale.scale.clean();

  return scale;
};

TraversableScale.prototype.transpose = function (int, down) {
  var scale = this.scale.transpose(int, down);
  var current = this.current().transpose(int, down);

  return scale.traverse(current);
};

TraversableScale.prototype.transposeDown = _.partial(TraversableScale.prototype.transpose, _, true);

// Move the current index by a number of steps, positive or negative
TraversableScale.prototype.shift = function (numSteps) {
  var scale = this.scale;
  var index = this.index + numSteps;

  var newIndex = mod(index, this.length);
  var octave = this.octave + Math.floor(index / this.length);

  return new TraversableScale(scale, newIndex, octave);
};

// Move the current index by a given interval
TraversableScale.prototype.shiftInterval = function (int, down) {
  var current = this.current().transpose(int, down);

  return this.withCurrent(current);
};

// Move the current index to a random spot
TraversableScale.prototype.random = function () {
  var index = Math.floor(Math.random() * this.length);
  var current = this.scale.scale[index];

  return this.withCurrent(current);
};

TraversableScale.prototype.withCurrent = function (n) {
  return this.scale.traverse(n);
};

// Create methods for TraversableScale that are equivalent to calling method on this.scale
_.each(['nearest', 'contains', 'hasInterval', 'descending'], function (method) {
  TraversableScale.prototype[method] = function () {
    return this.scale[method].apply(this.scale, arguments);
  };
});

module.exports.scales = scales;
module.exports.precedence = precedence;
module.exports.Scale = Scale;
module.exports.TraversableScale = TraversableScale;

module.exports.isTraversable = function (scale) {
  return scale instanceof TraversableScale;
};

module.exports.isScale = function (scale) {
  return scale instanceof Scale || scale instanceof TraversableScale;
};
module.exports.create = function (key, scaleName) {
  return new Scale(key, scaleName);
};