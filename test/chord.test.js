var chord = require('../lib/chord');

var assert = require('assert');

describe('Chord', function () {
  describe('#create', function () {
    it('should create a chord', function () {
      var c = chord.create('C7');
      assert.equal(c.root.name, 'C');
      assert(!c.bass);
      assert.equal(c.symbol, '7');
      assert.equal(c.toString(), 'C E G Bb');

      c = chord.create('C 7');
      assert.equal(c.toString(), 'C E G Bb');
    });

    it('should default to a major triad', function () {
      var c = chord.create('C');
      assert.equal(c.toString(), 'C E G');
    });

    it('should handle chord symbol aliases', function () {
      assert.equal(chord.create('Cmin').symbol, 'm');
      assert.equal(chord.create('Cmin').name, 'Cmin');
      assert.equal(chord.create('Cmin').toString(), 'C Eb G');
      assert.equal(chord.create('Cdom7').toString(), 'C E G Bb');
      assert.equal(chord.create('CminMaj9#11').toString(), 'C Eb G B D F#');
    });

    it('should handle slash chords', function () {
      var c = chord.create('C7/E');
      assert.equal(c.symbol, '7');
      assert.equal(c.bass.name, 'E');
      assert.equal(c.name, 'C7/E');
      assert.equal(c.toString(), 'E G Bb C');

      c = chord.create('Fmaj7/G');
      assert.equal(c.toString(), 'G F A C E');
    });
  });
});