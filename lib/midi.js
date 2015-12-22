// midi.js

var note = require('./note');
var _ = require('underscore');
var fs = require('fs');

var midiHeader = new Buffer([0x4D, 0x54, 0x68, 0x64]);
var trackHeader = new Buffer([0x4D, 0x54, 0x72, 0x6B]);
var trackFooter = new Buffer([0, 0xFF, 0x2F, 0]);

var ticksPerBeat = 96;

// Return a number in a buffer padded to have a certain number of bytes
var padNumber = function (num, totalBytes) {
  var numBytes = Math.floor(Math.log(num) / Math.log(0xff)) + 1;
  var buffer = new Buffer(totalBytes);

  buffer.fill(0);
  buffer.writeUIntBE(num, totalBytes - numBytes, numBytes);

  return buffer;
};

// Given a number, return a variable length quantity (in a buffer)
var makeVLQ = function (num) {
  var arr = [];

  if (num === 0) return new Buffer([0]);

  // Break up num into groups of 7-bit values
  while (num) {
    arr.unshift(num & (127));
    num >>= 7;
  }

  // Flip MSB of all 7-bit values except the last one
  arr = _.map(_.initial(arr), function (val, i) {
    return val + 128;
  }).concat(_.last(arr));

  return new Buffer(arr);
};

// Given a number of tracks, return a MIDI header
var makeHeaderChunk = function (format, numTracks) {
  var chunklen = padNumber(6, 4); // MIDI header is always 6 bytes long
  var ntracks = padNumber(numTracks, 2);
  var tickdiv = padNumber(ticksPerBeat, 2);
  format = padNumber(format, 2); // Usually format 1 MIDI file (multuple overlayed tracks)

  return Buffer.concat([midiHeader, chunklen, format, ntracks, tickdiv]);
};

// Return a buffer with a MIDI track that sets the tempo
var makeTempoTrack = function (options) {
  var tempo = 60e6 / options.tempo; // Microseconds per beat
  var setTempo = Buffer.concat([new Buffer([0, 0xFF, 0x51, 0x03]), padNumber(tempo, 3)]);
  var length = setTempo.length + trackFooter.length;

  return Buffer.concat([trackHeader, padNumber(length, 4), setTempo, trackFooter]);
};

var makePatchEvent = function (channel, patch) {
  return new Buffer([0, 0xC0 + channel, patch]);
};

// Make a MIDI note event
var makeNoteEvent = function (deltaTime, on, channel, note, velocity) {
  var status = on ? 0x90 : 0x80;

  status += channel;
  deltaTime = makeVLQ(deltaTime);

  return Buffer.concat([deltaTime, new Buffer([status, note, velocity])]);
};

// Make a multiple MIDI note events for a given chord
var makeChordEvent = function (deltaTime, on, firstChannel, chord, velocity) {
  var arr = [];

  // Make note event for first note after appropriate time
  arr.push(makeNoteEvent(deltaTime, on, firstChannel, noteValue(_.first(chord)), velocity));

  // Make note event for rest of the notes
  _.each(_.rest(chord), function (note, i) {
    arr.push(makeNoteEvent(0, on, i + firstChannel, noteValue(note), velocity));
  });

  return Buffer.concat(arr);
};

// Given a note type, return the time delta
// Note type is an object consisting of a number of beats and a note type or array of note types
// e.g. {beats: 2, type: ['eighth', 'sixteenth']} is a half note tied to a dotted eighth}
var noteLength = function (noteType, options) {
  // If there's no swing ratio, assume straight eighths
  var ratio = options && options.swingRatio ? options.swingRatio : 1;

  // Initialize ticks with the number of beats in `noteType.beats`
  var ticks = noteType.beats ? noteType.beats * ticksPerBeat : 0;

  // `noteType.type` can either be undefined, a string, or an array
  // We want `types` to be an empty array, a singleton array, or an array
  var types = noteType.type ? Array.prototype.concat(noteType.type) : [];

  return _.reduce(types, function (ticks, type) {
    switch (type) {
      case 'longEighth':
        return ticks + Math.ceil(ticksPerBeat - (ticksPerBeat / (ratio + 1)));
      case 'shortEighth':
        return ticks + Math.floor(ticksPerBeat / (ratio + 1));
      case 'eighth':
        return ticks + ticksPerBeat / 2;
      case 'triplet':
        return ticks + ticksPerBeat / 3;
      case 'sixteenth':
        return ticks + ticksPerBeat / 4;
      default:
        return ticks;
    }
  }, ticks);
};

// Return the MIDI value of a note object
var noteValue = function (n) {
  var value = n.clean().octave * 12;
  return value + note.create('C').getHalfSteps(n);
};

// Given note list, return a buffer containing note events
var makeNoteEvents = function (notes, options) {
  var restBuffer = 0;

  var events = _.reduce(notes, function (arr, obj) {
    var time = noteLength(obj.type, options);

    if (obj.note) {
      arr.push(makeNoteEvent(restBuffer, true, 0, noteValue(obj.note), options.noteVelocity)); // On
      arr.push(makeNoteEvent(time, false, 0, noteValue(obj.note), options.noteVelocity)); // Off
      restBuffer = 0;
    }
    else {
      restBuffer += time;
    }

    return arr;
  }, []);

  return Buffer.concat(events);
};

// Given chord data, return a buffer containing note events
var makeChordEvents = function (chords, options) {
  var events = _.reduce(chords, function (arr, obj) {
    var time = noteLength(obj.type, options);
    var chord = obj.chord.inOctave(options.chordOctave).chord;

    arr.push(makeChordEvent(0, true, 1, chord, options.chordVelocity)); // On
    arr.push(makeChordEvent(time, false, 1, chord, options.chordVelocity)); // Off

    return arr;
  }, []);

  return Buffer.concat(events);
};

// Return a buffer with a melody track
var makeMelodyTrack = function (notes, options) {
  var noteEvents = makeNoteEvents(notes, options);
  var setPatch = makePatchEvent(0, options.melodyPatch);
  var length = setPatch.length + noteEvents.length + trackFooter.length;

  return Buffer.concat([trackHeader, padNumber(length, 4), setPatch, noteEvents, trackFooter]);
};

// Return a buffer with a chord track
var makeChordTrack = function (chords, options) {
  var chordEvents = makeChordEvents(chords, options);

  // Set all channels
  var setPatches = _.reduce(_.range(0xf), function (buffer, channel) {
    return Buffer.concat([buffer, makePatchEvent(channel, options.chordPatch)]);
  }, new Buffer(0));

  var length = setPatches.length + chordEvents.length + trackFooter.length;

  return Buffer.concat([trackHeader, padNumber(length, 4), setPatches, chordEvents, trackFooter]);
};

// Return MIDI buffer containing an improvisation
var improvChart = function (data, options) {
  var header = makeHeaderChunk(1, 3);
  var tempoTrack = makeTempoTrack(options);
  var noteTrack = makeMelodyTrack(data.noteList, options);
  var chordTrack = makeChordTrack(data.chordScales, options);

  return Buffer.concat([header, tempoTrack, noteTrack, chordTrack]);
};

// Return MIDI buffer containing chords
var chordChart = function (data, options) {
  var header = makeHeaderChunk(1, 2);
  var tempoTrack = makeTempoTrack(options);
  var chordTrack = makeChordTrack(data.chords, options);

  return Buffer.concat([header, tempoTrack, chordTrack]);
};

module.exports.noteLength = noteLength;
module.exports.makeVLQ = makeVLQ;
module.exports.noteValue = noteValue;

module.exports.output = function (type, data, filename, options) {
  var defaultOptions = {
    tempo: 120, // BPM
    swingRatio: 1.5, // How much longer first eighth note is than second
    melodyPatch: 56,
    chordPatch: 0,
    noteVelocity: 80,
    chordVelocity: 60,
    chordOctave: 4
  };
  // Map of type string to function
  var types = {
    improvChart: improvChart,
    chordChart: chordChart
  };
  var buffer;

  options = _.defaults(options || {}, defaultOptions);

  if (types[type]) buffer = types[type](data, options);

  // Write MIDI to specified file
  fs.writeSync(fs.openSync(filename, 'w'), buffer, 0, buffer.length);
};