// midi.js

var note = require('./note');
var _ = require('underscore');
var fs = require('fs');

var midiHeader = new Buffer([0x4D, 0x54, 0x68, 0x64]);
var trackHeader = new Buffer([0x4D, 0x54, 0x72, 0x6B]);
var trackFooter = new Buffer([0, 0xFF, 0x2F, 0]);

var ticksPerBeat = 96;
var defaultVelocity = 40;

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
var makeHeaderChunk = function (numTracks) {
  var chunklen = padNumber(6, 4); // MIDI header is always 6 bytes long
  var format = padNumber(1, 2); // Format 1 MIDI file (multuple overlayed tracks)
  var ntracks = padNumber(numTracks, 2);
  var tickdiv = padNumber(ticksPerBeat, 2);

  return Buffer.concat([midiHeader, chunklen, format, ntracks, tickdiv]);
};

// Return a buffer with a MIDI track that sets the tempo
var makeTempoTrack = function (options) {
  var bpm = options.tempo;
  var tempo = 60e6 / bpm; // Microseconds per beat
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
var noteLength = function (type, options) {
  var ratio = options.swingRatio;

  switch (type) {
    case 'longEighth':
      return Math.ceil(ticksPerBeat - (ticksPerBeat / (ratio + 1)));
    case 'shortEighth':
      return Math.floor(ticksPerBeat / (ratio + 1));
    case 'triplet':
      return ticksPerBeat / 3;
    case 'sixteenth':
      return ticksPerBeat / 4;
    default:
      return ticksPerBeat;
  }
};

// Return the MIDI value of a note object
var noteValue = function (n) {
  var value = n.clean().octave * 12;
  return value + note.create('C').getHalfSteps(n);
};

// Given improv data, return a list of notes with metadata
var makeImprovNoteList = function (data) {
  var noteArr = _.reduce(data, function (arr, obj) {
    return arr.concat(obj.notes);
  }, []);

  return _.flatten(_.map(noteArr, function (arr) {
    return _.map(arr, function (note, i) {
      var type;

      if (arr.length === 2 && i === 0) type = 'longEighth';
      if (arr.length === 2 && i === 1) type = 'shortEighth';
      if (arr.length === 3) type = 'triplet';
      if (arr.length === 4) type = 'sixteenth';

      return { note: note, type: type };
    });
  }));
};

// Given improv data, return a list of chords and the number of beats they span
var makeImprovChordList = function (data) {
  return _.map(data, function (obj) {
    return { chord: obj.chord.octave(4), beats: obj.notes.length };
  });
};

// Given improv data, return a buffer containing note events
var makeImprovNoteEvents = function (data, options) {
  var noteList = makeImprovNoteList(data);
  var restBuffer = 0;

  var events = _.reduce(noteList, function (arr, obj) {
    var time = noteLength(obj.type, options);

    if (obj.note) {
      arr.push(makeNoteEvent(restBuffer, true, 0, noteValue(obj.note), defaultVelocity)); // On
      arr.push(makeNoteEvent(time, false, 0, noteValue(obj.note), defaultVelocity)); // Off
      restBuffer = 0;
    }
    else {
      restBuffer += time;
    }

    return arr;
  }, []);

  return Buffer.concat(events);
};

// Given improv data, return a buffer containing note events
var makeImprovChordEvents = function (data, options) {
  var chordList = makeImprovChordList(data);

  var events = _.reduce(chordList, function (arr, obj) {
    var time = obj.beats * ticksPerBeat;

    arr.push(makeChordEvent(0, true, 1, obj.chord.chord, defaultVelocity)); // On
    arr.push(makeChordEvent(time, false, 1, obj.chord.chord, defaultVelocity)); // Off

    return arr;
  }, []);

  return Buffer.concat(events);
};

// Return a buffer with a melody track
var makeImprovMelodyTrack = function (data, options) {
  var noteEvents = makeImprovNoteEvents(data, options);
  var setPatch = makePatchEvent(0, options.melodyPatch);
  var length = setPatch.length + noteEvents.length + trackFooter.length;

  return Buffer.concat([trackHeader, padNumber(length, 4), setPatch, noteEvents, trackFooter]);
};

// Return a buffer with a chord track
var makeImprovChordTrack = function (data, options) {
  var chordEvents = makeImprovChordEvents(data, options);

  // Set all channels
  var setPatches = _.reduce(_.range(0xf), function (buffer, channel) {
    return Buffer.concat([buffer, makePatchEvent(channel, options.chordPatch)]);
  }, new Buffer(0));

  var length = setPatches.length + chordEvents.length + trackFooter.length;

  return Buffer.concat([trackHeader, padNumber(length, 4), setPatches, chordEvents, trackFooter]);
};

// Return MIDI buffer containing an improvisation
var improv = function (data, options) {
  var header = makeHeaderChunk(2);
  var tempoTrack = makeTempoTrack(options);
  var noteTrack = makeImprovMelodyTrack(data, options);
  var chordTrack = makeImprovChordTrack(data, options);

  return Buffer.concat([header, tempoTrack, noteTrack, chordTrack]);
};

module.exports.output = function (type, data, filename, options) {
  var defaultOptions = {
    tempo: 120, // BPM
    swingRatio: 1.5, // How much longer first eighth note is than second
    melodyPatch: 56,
    chordPatch: 0
  };
  var buffer;

  options = _.defaults(options || {}, defaultOptions);

  switch (type) {
    case 'improv':
      buffer = improv(data, options);
      break;
  }

  // Write MIDI to specified file
  fs.writeSync(fs.openSync(filename, 'w'), buffer, 0, buffer.length);
};