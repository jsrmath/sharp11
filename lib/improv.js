// improv.js

var scale = require('./scale');
var chord = require('./chord');
var note = require('./note');
var midi = require('./midi');
var _ = require('underscore');
var random = require("random-js")();

// Given a traversable scale and settings, return true if current note is in range
var scaleInRange = function (scale, settings) {
  return !scale.current().lowerThan(settings.range[0]) && !scale.current().higherThan(settings.range[1]);
};

// Given a chord and a previous traversable scale, return a new traversable scale
var getScale = function (ch, lastNote, settings) {
  var scales = ch.scales();
  var scaleIndex = Math.floor(-2 * settings.dissonance * Math.log(random.real(0, 1)));
  var newScale = scales[scaleIndex < scales.length ? scaleIndex : 0];
  var dir;

  // If there's no previous scale, start somewhere random
  lastNote = lastNote || note.random(settings.range[0], settings.range[1]);

  // Traverse at nearest note, shifting appropriately if out of range
  newScale = newScale.traverse(newScale.nearest(lastNote));

  while (!scaleInRange(newScale, settings)) {
    dir = newScale.current().lowerThan(settings.range[0]) ? 1 : -1;
    newScale = newScale.shift(dir);
  }

  // Start traversing the new scale from the nearest note to the previous scale's current note
  return newScale;
};

// Given improvisation settings, return a number of notes in for a note group
var getNumNotes = function (settings) {
  if (settings.useSixteenths && random.bool(2 * settings.rhythmicVariety / 3)) {
    return random.bool() ? 3 : 4;
  }

  if (!settings.useSixteenths && random.bool(settings.rhythmicVariety / 2)) {
    return 3;
  }

  return 2;
};

// Given a scale, direction, and improvisation settings
// return a group of a given number of notes and a new direction
var improviseNoteGroup = function (scale, dir, numNotes, settings) {
  var noteGroupObj = {
    notes: [],
    dir: dir
  };

  _.times(numNotes, function () {
    var dir = noteGroupObj.dir;

    // Potentially insert rest based on settings
    if (random.bool(settings.rests / 2)) return noteGroupObj.notes.push(null);

    // Potentially jump to random note based on settings
    if (random.bool(settings.jumpiness / 2)) {
      do {
        scale = scale.random();
      } while (!scaleInRange(scale, settings));

      noteGroupObj.notes.push(scale.current());
      return noteGroupObj;
    }

    // Potentially change direction based on settings
    if (random.bool(settings.changeDir / 2)) dir = -dir;

    scale = scale.shift(dir);

    // If we're out of bounds, reverse the direction and shift twice
    if (!scaleInRange(scale, settings)) {
      dir = -dir;
      scale = scale.shift(dir * 2);
    }

    noteGroupObj.notes.push(scale.current());
    noteGroupObj.dir = dir;
  });

  return noteGroupObj;
};

// Improvise over a chord chart
// Return an object containing an array of objects
// Each object has a chord, a scale, and an array of arrays of notes, each representing one beat
var overChart = function (chart, settings) {
  // State we keep track of during improvisation
  var notes = [];
  var lastNote = null;
  var dir = random.pick([-1, 1]);

  // Ensure chords are chord objects
  _.each(chart, function (arr) {
    if (!chord.isChord(arr[0])) arr[0] = chord.create(arr[0]);
  });

  // Collect groups of notes
  _.each(chart, function (arr) {
    var ch = arr[0];
    var numBeats = arr[1];
    var scale = getScale(ch, lastNote, settings);
    var noteGroupObj = {
      chord: ch,
      scale: scale,
      notes: []
    };

    // Collect groups of notes for each beat the chord is being played over
    _.times(numBeats, function () {
      var noteGroup = improviseNoteGroup(scale, dir, getNumNotes(settings), settings);
      noteGroupObj.notes.push(noteGroup.notes);
      dir = noteGroup.dir;

      lastNote = _.find(noteGroup.notes.concat().reverse(), _.identity);

      // Update scale so that it's on the most recent note
      if (lastNote) scale = scale.withCurrent(lastNote);
    });

    notes.push(noteGroupObj);
  });

  return notes;
};

var Improvisor = function (settings) {
  var defaultSettings = {
    dissonance: 0.5, // Likelihood of picking a more dissonant scale
                     // function is i = -2d(ln x), where d = dissonance (0 <= d <= 1),
                     // x = random number (0 <= x <= 1), i = scale index (i >= 0)
    changeDir: 0.5, // Likelihood of changing chromatic direction, range 0 to 1
    jumpiness: 0.5, // Likelihood of jumping intervals
    rests: 0.5, // Likelihood of a note being a rest (previous note is sustained)
    rhythmicVariety: 0.5, // Likelihood of rhythmic variety
    useSixteenths: true, // Use sixteenth notes
    range: ['C4', 'C6'] // Note range
  };

  settings = _.defaults(settings || {}, defaultSettings);

  this.settings = settings;
};

Improvisor.prototype.over = function (type, obj) {
  switch (type) {
    case 'chart':
    case 'chordChart':
      var chart = overChart(obj, this.settings);

      chart.midi = function (filename, options, callback) {
        return midi.output('improv', chart, filename, options, callback);
      };
      chart.isImprovChart = true;
      
      return chart;

    default:
      throw new Error('Cannot improvise over: ' + type);
  }
};

module.exports.create = function (settings) {
  return new Improvisor(settings);
};