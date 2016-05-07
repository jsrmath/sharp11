// improv.js

var scale = require('./scale');
var chord = require('./chord');
var note = require('./note');
var midi = require('./midi');
var _ = require('underscore');
var random = require("random-js")();

// Given a chord and a previous traversable scale, return a new traversable scale
var getScale = function (ch, lastNote, settings) {
  var scales = ch.scales();
  var scaleIndex = Math.floor(-2 * settings.dissonance * Math.log(random.real(0, 1)));
  var newScale = scales[scaleIndex % scales.length];
  var dir;

  // If there's no previous scale, start somewhere random
  lastNote = lastNote || note.random(settings.range);

  // Traverse at nearest note, shifting appropriately if out of range
  newScale = newScale.traverse(newScale.nearest(lastNote));

  while (!newScale.current().inRange(settings.range)) {
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

  // True if we are allowed to use rests here
  var useRests = numNotes === 2 || !settings.onlyEighthRests;

  _.times(numNotes, function () {
    var dir = noteGroupObj.dir;

    // Potentially insert rest based on settings
    if (useRests && random.bool(settings.rests)) return noteGroupObj.notes.push(null);

    // Potentially jump to random note based on settings
    if (random.bool(settings.jumpiness)) {
      do {
        scale = scale.random();
      } while (!scale.current().inRange(settings.range));

      noteGroupObj.notes.push(scale.current());
      return noteGroupObj;
    }

    // Potentially change direction based on settings
    if (random.bool(settings.changeDir)) dir = -dir;

    scale = scale.shift(dir);

    // If we're out of bounds, reverse the direction and shift twice
    if (!scale.current().inRange(settings.range)) {
      dir = -dir;
      scale = scale.shift(dir * 2);
    }

    noteGroupObj.notes.push(scale.current());
    noteGroupObj.dir = dir;
  });

  return noteGroupObj;
};

// Return the total number of beats in a chart
var totalBeats = function (chart) {
  return _.reduce(chart, function (total, arr) {
    return total + arr[1];
  }, 0);
};

// Improvise over a chord chart
// Return an object containing an array of objects
// Each object has a chord, a scale, and an array of arrays of notes, each representing one beat
var overChart = function (chart, settings) {
  // State we keep track of during improvisation
  var notes = [];
  var lastNote = null;
  var dir = random.pick([-1, 1]);
  var beats = totalBeats(chart);
  var deltas = {}; // An object that keeps track of deltas for settings that change over time

  // Ensure chart is a proper ChordChart object
  chart = chord.createChart(chart);

  // Configure deltas for settings that allow for ranges
  _.each(['dissonance', 'changeDir', 'jumpiness', 'rests', 'rhythmicVariety'], function (setting) {
    if (settings[setting] instanceof Array) {
      deltas[setting] = (settings[setting][1] - settings[setting][0]) / beats;
      settings[setting] = settings[setting][0]; // Start at the first element in the range
    }
    else {
      deltas[setting] = 0;
    }
  });

  // Collect groups of notes
  _.each(chart.chart, function (obj) {
    var ch = obj.chord;
    var numBeats = obj.duration.beats;
    var scale = getScale(ch, lastNote, settings);
    var noteGroupObj = {
      chord: ch,
      scale: scale,
      notes: [],
      duration: {beats: numBeats}
    };

    // Collect groups of notes for each beat the chord is being played over
    _.times(numBeats, function () {
      var noteGroup = improviseNoteGroup(scale, dir, getNumNotes(settings), settings);
      noteGroupObj.notes.push(noteGroup.notes);
      dir = noteGroup.dir;

      lastNote = _.last(_.filter(noteGroup.notes, _.identity));

      // Update scale so that it's on the most recent note
      if (lastNote) scale = scale.withCurrent(lastNote);

      // Update range settings based on deltas
      _.each(deltas, function (delta, setting) {
        settings[setting] += delta;
      });
    });

    notes.push(noteGroupObj);
  });

  return new ImprovChart(notes);
};

var Improv = function (settings) {
  var defaultSettings = {
    dissonance: 0.5, // Likelihood of picking a more dissonant scale
                     // function is i = -2d(ln x), where d = dissonance, number (0 to 1) or range;
                     // x = random number (0 to 1); i = scale index
    changeDir: 0.25, // Likelihood of changing chromatic direction, number (0 to 1) or range
    jumpiness: 0.25, // Likelihood of jumping intervals, number (0 to 1) or range
    rests: [0.35, 0], // Likelihood of a note being a rest (previous note is sustained), number (0 to 1) or range
    rhythmicVariety: [0, 0.75], // Likelihood of rhythmic variety, number (0 to 1) or range
    useSixteenths: true, // Use sixteenth notes
    onlyEighthRests: false, // If true, don't put rests in triplet or sixteenth blocks
    range: ['C4', 'C6'] // Note range
  };

  this.settings = _.defaults(settings || {}, defaultSettings);
};

// Given improv data, return a list of notes with metadata
var makeImprovNoteList = function (data) {
  var noteArr = _.reduce(data, function (arr, obj) {
    return arr.concat(obj.notes);
  }, []);

  return _.flatten(_.map(noteArr, function (arr) {
    return _.map(arr, function (note, i) {
      var duration = {};

      if (arr.length === 2 && i === 0) duration.type = 'longEighth';
      if (arr.length === 2 && i === 1) duration.type = 'shortEighth';
      if (arr.length === 3) duration.type = 'triplet';
      if (arr.length === 4) duration.type = 'sixteenth';

      return { note: note, duration: duration };
    });
  }));
};

var ImprovChart = function (chart) {
  this.chart = chart;

  this.noteList = makeImprovNoteList(chart);

  this.midi = function (settings) {
    return midi.create('improvChart', this, settings);
  };

  this.toString = function () {
    return _.map(chart, function (obj) {
      return '(' + obj.chord.name + ' => ' + obj.scale.name + ') ' + _.map(obj.notes, function (arr) {
        return _.map(arr, function (x) { return x || '_'; }).join(' ');
      }).join(' | ');
    }).join('\n');
  };
};

Improv.prototype.over = function (type, obj) {
  switch (type) {
    case 'chart':
    case 'chordChart':
      return overChart(obj, this.settings);
    default:
      throw new Error('Cannot improvise over: ' + type);
  }
};

module.exports.create = function (settings) {
  return new Improv(settings);
};

module.exports.isImprovChart = function (chart) {
  return chart instanceof ImprovChart;
};