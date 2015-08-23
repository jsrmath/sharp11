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
    if (useRests && random.bool(settings.rests / 2)) return noteGroupObj.notes.push(null);

    // Potentially jump to random note based on settings
    if (random.bool(settings.jumpiness / 2)) {
      do {
        scale = scale.random();
      } while (!scale.current().inRange(settings.range));

      noteGroupObj.notes.push(scale.current());
      return noteGroupObj;
    }

    // Potentially change direction based on settings
    if (random.bool(settings.changeDir / 2)) dir = -dir;

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
  var restDelta = 0;
  var rhythmDelta = 0;

  // Ensure chart is a proper ChordChart object
  chart = chord.createChart(chart);

  // Configure rest range and rhythm range
  if (settings.restRange) {
    settings.rests = settings.restRange[0];
    restDelta = (settings.restRange[1] - settings.restRange[0]) / beats;
  }
  if (settings.rhythmRange) {
    settings.rhythmicVariety = settings.rhythmRange[0];
    rhythmDelta = (settings.rhythmRange[1] - settings.rhythmRange[0]) / beats;
  }

  // Collect groups of notes
  _.each(chart.chords, function (obj) {
    var ch = obj.chord;
    var numBeats = obj.type.beats;
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

      lastNote = _.last(_.filter(noteGroup.notes, _.identity));

      // Update scale so that it's on the most recent note
      if (lastNote) scale = scale.withCurrent(lastNote);

      // Update rests and rhythmicVariety if range is being used
      settings.rests += restDelta;
      settings.rhythmicVariety += rhythmDelta;
    });

    notes.push(noteGroupObj);
  });

  return new ImprovChart(notes);
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
    onlyEighthRests: false, // If true, don't put rests in triplet or sixteenth blocks
    range: ['C4', 'C6'], // Note range
    restRange: null, // Rests decrease as time goes on, within range specified
    rhythmRange: null // Rhythmic variety increases as time goes on, within range specified
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
      var type = {};

      if (arr.length === 2 && i === 0) type.type = 'longEighth';
      if (arr.length === 2 && i === 1) type.type = 'shortEighth';
      if (arr.length === 3) type.type = 'triplet';
      if (arr.length === 4) type.type = 'sixteenth';

      return { note: note, type: type };
    });
  }));
};

var ImprovChart = function (chart) {
  this.chart = chart;

  this.chordScales = _.map(chart, function (obj) {
    return { chord: obj.chord, scale: obj.scale, type: {beats: obj.notes.length} };
  });

  this.noteList = makeImprovNoteList(chart);

  this.midi = function (filename, options, callback) {
    return midi.output('improv', this, filename, options, callback);
  };

  this.toString = function () {
    return _.map(chart, function (obj) {
      return '(' + obj.chord.name + ' => ' + obj.scale.name + ') ' + _.map(obj.notes, function (arr) {
        return _.map(arr, function (x) { return x || '_'; }).join(' ');
      }).join(' | ');
    }).join('\n');
  };
};

Improvisor.prototype.over = function (type, obj) {
  switch (type) {
    case 'chart':
    case 'chordChart':
      return overChart(obj, this.settings);
    default:
      throw new Error('Cannot improvise over: ' + type);
  }
};

module.exports.create = function (settings) {
  return new Improvisor(settings);
};

module.exports.isImprovChart = function (chart) {
  return chart instanceof ImprovChart;
};