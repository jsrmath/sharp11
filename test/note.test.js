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
});