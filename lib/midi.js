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
var makeTempoTrack = function (settings) {
  var tempo = 60e6 / settings.tempo; // Microseconds per beat
  var setTempo = Buffer.concat([new Buffer([0, 0xFF, 0x51, 0x03]), padNumber(tempo, 3)]);
  var length = setTempo.length + trackFooter.length;

  return Buffer.concat([trackHeader, padNumber(length, 4), setTempo, trackFooter]);
};

var makePatchEvent = function (channel, patch) {
  // MIDI patches are numbered starting at 1, but the MIDI file format starts them at 0
  // Don't ask me why; I didn't design it
  return new Buffer([0, 0xC0 + channel, patch - 1]);
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

// Given a note duration, return the time delta
var noteLength = function (duration, settings) {
  // If there's no swing ratio, assume straight eighths
  var ratio = settings && settings.swingRatio ? settings.swingRatio : 1;
  return Math.round(ticksPerBeat * duration.value(ratio));
};

// Return the MIDI value of a note object
var noteValue = function (n) {
  return n.value();
};

// Given note list, return a buffer containing note events
var makeNoteEvents = function (notes, settings) {
  var restBuffer = 0;

  var events = _.reduce(notes, function (arr, obj) {
    var time = noteLength(obj.duration, settings);

    if (obj.note) {
      arr.push(makeNoteEvent(restBuffer, true, 0, noteValue(obj.note), settings.noteVelocity)); // On
      arr.push(makeNoteEvent(time, false, 0, noteValue(obj.note), settings.noteVelocity)); // Off
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
var makeChordEvents = function (chords, settings) {
  var events = _.reduce(chords, function (arr, obj) {
    var time = noteLength(obj.duration, settings);
    var chord = obj.chord.inOctave(settings.chordOctave).chord;

    arr.push(makeChordEvent(0, true, 1, chord, settings.chordVelocity)); // On
    arr.push(makeChordEvent(time, false, 1, chord, settings.chordVelocity)); // Off

    return arr;
  }, []);

  return Buffer.concat(events);
};

// Return a buffer with a melody track
var makeMelodyTrack = function (notes, settings) {
  var noteEvents = makeNoteEvents(notes, settings);
  var setPatch = makePatchEvent(0, settings.melodyPatch);
  var length = setPatch.length + noteEvents.length + trackFooter.length;

  return Buffer.concat([trackHeader, padNumber(length, 4), setPatch, noteEvents, trackFooter]);
};

// Return a buffer with a chord track
var makeChordTrack = function (chords, settings) {
  var chordEvents = makeChordEvents(chords, settings);

  // Set all channels
  var setPatches = _.reduce(_.range(0xf), function (buffer, channel) {
    return Buffer.concat([buffer, makePatchEvent(channel, settings.chordPatch)]);
  }, new Buffer(0));

  var length = setPatches.length + chordEvents.length + trackFooter.length;

  return Buffer.concat([trackHeader, padNumber(length, 4), setPatches, chordEvents, trackFooter]);
};

// Utility functions
module.exports.noteLength = noteLength;
module.exports.makeVLQ = makeVLQ;
module.exports.noteValue = noteValue;

var Midi = function (settings, tracks) {
  this.settings = _.defaults(settings || {}, {
    tempo: 120, // BPM
    swingRatio: 1.5, // How much longer first eighth note is than second
    melodyPatch: 57,
    chordPatch: 1,
    noteVelocity: 80,
    chordVelocity: 60,
    chordOctave: 3
  });

  this.tracks = tracks;
};

// Returns a new Midi object with added chord track
Midi.prototype.addChordTrack = function (chordList) {
  var chordTrack = makeChordTrack(chordList, this.settings);
  return new Midi(this.settings, this.tracks.concat([chordTrack]));
};

// Returns a new Midi object with added melody track
Midi.prototype.addMelodyTrack = function (noteList) {
  var melodyTrack = makeMelodyTrack(noteList, this.settings);
  return new Midi(this.settings, this.tracks.concat([melodyTrack]));
};

// Get raw MIDI data in buffer format
Midi.prototype.data = function () {
  var header = makeHeaderChunk(1, 3);
  var tempoTrack = makeTempoTrack(this.settings);
  return Buffer.concat([header, tempoTrack].concat(this.tracks));
};

// Server-side only
Midi.prototype.write = function (filename, cb) {
  var data = this.data();
  fs.open(filename, 'w', function (err, fd) {
    if (err) cb(err);

    fs.write(fd, data, 0, data.length, cb);
  });
};

// Server-side only
Midi.prototype.writeSync = function (filename) {
  var data = this.data();
  fs.writeSync(fs.openSync(filename, 'w'), data, 0, data.length);
};

module.exports.create = function (settings) {
  return new Midi(settings, []);
};