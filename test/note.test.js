var note = require('../lib/note');

var assert = require('assert');

describe('Note', function () {
  describe('#create', function () {
    it('should create a valid note', function () {
      assert.equal(note.create('Bb').letter, 'B');
      assert.equal(note.create('Bb').acc, 'b');
      assert.equal(note.create('Bb').name, 'Bb');

      assert.equal(note.create('D##').letter, 'D');
      assert.equal(note.create('D##').acc, '##');
      assert.equal(note.create('D##').name, 'D##');
    });

    it('should handle "s" and "x" accidentals', function () {
      assert.equal(note.create('Cs').acc, '#');
      assert.equal(note.create('Cx').acc, '##');
    });

    it('should handle "n" accidentals', function () {
      assert.equal(note.create('Cn').acc, 'n');
      assert.equal(note.create('Cn').name, 'C');

      assert.equal(note.create('C').acc, 'n');
      assert.equal(note.create('C').name, 'C');
    });
  });

  describe('#sharp', function () {
    it('should sharp a note', function () {
      assert.equal(note.create('D').sharp().name, 'D#');
      assert.equal(note.create('Db').sharp().name, 'D');
      assert.equal(note.create('D#').sharp().name, 'D##');
      assert.equal(note.create('Dbb').sharp().name, 'Db');
      assert.equal(note.create('D##').sharp().name, 'E#');
      assert.equal(note.create('B##').sharp().name, 'C##');
    });
  });

  describe('#flat', function () {
    it('should flat a note', function () {
      assert.equal(note.create('D').flat().name, 'Db');
      assert.equal(note.create('Db').flat().name, 'Dbb');
      assert.equal(note.create('D#').flat().name, 'D');
      assert.equal(note.create('Dbb').flat().name, 'Cb');
      assert.equal(note.create('D##').flat().name, 'D#');
      assert.equal(note.create('Cbb').flat().name, 'Bbb');
    });
  });

  describe('#clean', function () {
    it('should get rid of double sharps, double flats, B#, E#, Cb, and Fb', function () {
      assert.equal(note.create('B#').clean().name, 'C');
      assert.equal(note.create('B##').clean().name, 'C#');
      assert.equal(note.create('C##').clean().name, 'D');
      assert.equal(note.create('Dbb').clean().name, 'C');
    });
  });

  describe('#shift', function () {
    it('should shift a note by a given number of half steps', function () {
      assert.equal(note.create('D').shift(-2).name, 'Dbb');
      assert.equal(note.create('D').shift(-1).name, 'Db');
      assert.equal(note.create('D').shift(0).name, 'D');
      assert.equal(note.create('D').shift(1).name, 'D#');
      assert.equal(note.create('D').shift(2).name, 'D##');
    });
  });

  describe('#getInterval', function () {
    it('should find the interval between two notes', function () {
      assert.equal(note.create('C').getInterval(note.create('F')).name, 'P4');
      assert.equal(note.create('C').getInterval('F').name, 'P4');
      assert.equal(note.create('F').getInterval('C').name, 'P5');

      assert.equal(note.create('D').getInterval('D#').name, 'aug1');
      assert.equal(note.create('D').getInterval('Db').name, 'dim1');
      assert.equal(note.create('D').getInterval('F').name, 'm3');
      assert.equal(note.create('D').getInterval('F#').name, 'M3');
      assert.equal(note.create('D').getInterval('Fb').name, 'dim3');
      assert.equal(note.create('D').getInterval('F##').name, 'aug3');
    });
  });

  describe('#transpose', function () {
    it('should transpose by a given interval', function () {
      assert.equal(note.create('D').transpose('dim3').name, 'Fb');
      assert.equal(note.create('D').transpose('m3').name, 'F');
      assert.equal(note.create('D').transpose('M3').name, 'F#');
      assert.equal(note.create('D').transpose('aug3').name, 'F##');

      assert.equal(note.create('D').transpose('dim5').name, 'Ab');
      assert.equal(note.create('D').transpose('P5').name, 'A');
      assert.equal(note.create('D').transpose('aug5').name, 'A#');

      assert.equal(note.create('B').transpose('dim11').name, 'Eb');
    });
  });
});