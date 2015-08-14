var midi = require('../lib/midi');

var assert = require('assert');

describe('Midi Engine', function () {
  describe('#makeVLQ', function () {
    assert.equal(midi.makeVLQ(0x0).toString('hex'), '00');
    assert.equal(midi.makeVLQ(0x40).toString('hex'), '40');
    assert.equal(midi.makeVLQ(0x7f).toString('hex'), '7f');
    assert.equal(midi.makeVLQ(0x80).toString('hex'), '8100');
    assert.equal(midi.makeVLQ(0x2000).toString('hex'), 'c000');
    assert.equal(midi.makeVLQ(0x3fff).toString('hex'), 'ff7f');
    assert.equal(midi.makeVLQ(0x4000).toString('hex'), '818000');
  });

  describe('#noteLength', function () {
    assert.equal(midi.noteLength({beats: 4}), 384);
    assert.equal(midi.noteLength({beats: 1, type: 'eighth'}), 144);
    assert.equal(midi.noteLength({beats: 1, type: ['eighth', 'sixteenth']}), 168);
    assert.equal(midi.noteLength({type: ['eighth', 'sixteenth']}), 72);
    assert.equal(midi.noteLength({type: 'longEighth'}, {swingRatio: 2}), 64);
  });
});