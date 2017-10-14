var note = require('../lib/note');

var assert = require('assert');

describe('Note', function () {
  describe('#create', function () {
    it('should create a valid note', function () {
      assert.equal(note.create('Bb').letter, 'B');
      assert.equal(note.create('Bb').acc, 'b');
      assert.equal(note.create('Bb').name, 'Bb');
      assert.equal(note.create('Bb').fullName, 'Bb');

      assert.equal(note.create('D##').letter, 'D');
      assert.equal(note.create('D##').acc, '##');
      assert.equal(note.create('D##').name, 'D##');
      assert.equal(note.create('D##').fullName, 'D##');
    });

    it('should handle "x" accidentals', function () {
      assert.equal(note.create('Cx').acc, '##');
    });

    it('should handle "n" accidentals', function () {
      assert.equal(note.create('Cn').acc, 'n');
      assert.equal(note.create('Cn').name, 'C');

      assert.equal(note.create('C').acc, 'n');
      assert.equal(note.create('C').name, 'C');
    });

    it('should handle octave numbers', function () {
      assert.equal(note.create('C').octave, null);
      assert.equal(note.create('C4').octave, 4);
      assert.equal(note.create('Bb0').octave, 0);

      assert.equal(note.create('C4').fullName, 'C4');

      assert.throws(function () {
        note.create('A', -1);
      });
      assert.throws(function () {
        note.create('A', 10);
      });
    });

    it('should handle note objects', function () {
      assert.equal(note.create(note.create('C')).name, 'C');
      assert.equal(note.create(note.create('C'), 4).toString(), 'C4');
      assert.equal(note.create(note.create('C6'), 4).toString(), 'C4');
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

    it('should get preserve octave numbers', function () {
      assert.equal(note.create('C4').clean().octave, 4);
      assert.equal(note.create('Cb4').clean().toString(), 'B3');
      assert.equal(note.create('B#3').clean().toString(), 'C4');
      assert.equal(note.create('Cbb4').clean().toString(), 'Bb3');
      assert.equal(note.create('B##3').clean().toString(), 'C#4');
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

      assert.equal(note.create('F#').getInterval('E').name, 'm7');
    });
  });

  describe('#transpose', function () {
    it('should transpose up by a given interval', function () {
      assert.equal(note.create('D').transpose('dim3').name, 'Fb');
      assert.equal(note.create('D').transpose('m3').name, 'F');
      assert.equal(note.create('D').transpose('M3').name, 'F#');
      assert.equal(note.create('D').transpose('aug3').name, 'F##');

      assert.equal(note.create('D').transpose('dim5').name, 'Ab');
      assert.equal(note.create('D').transpose('P5').name, 'A');
      assert.equal(note.create('D').transpose('aug5').name, 'A#');

      assert.equal(note.create('B').transpose('dim11').name, 'Eb');
      assert.equal(note.create('Db').transpose('aug7').name, 'C#');

      assert.equal(note.create('Db').transpose('P1').name, 'Db');
    });

    it('should transpose down by a given interval', function () {
      assert.equal(note.create('D').transpose('m3', true).name, 'B');
      assert.equal(note.create('F#').transpose('aug4', true).name, 'C');
    });

    it('should handle octave numbers', function () {
      assert.equal(note.create('A4').transpose('P4').toString(), 'D5');
      assert.equal(note.create('A4').transpose('P11').toString(), 'D6');
      assert.equal(note.create('A4').transpose('m3').toString(), 'C5');
      assert.equal(note.create('A4').transpose('dim3').toString(), 'Cb5');
      assert.equal(note.create('A4').transpose('aug2').toString(), 'B#4');
      assert.equal(note.create('C4').transpose('P8').toString(), 'C5');

      assert.equal(note.create('D5').transpose('P4', true).toString(), 'A4');
      assert.equal(note.create('D5').transpose('P11', true).toString(), 'A3');
    });
  });

  describe('#transposeDown', function () {
    it('should transpose down by a given interval', function () {
      assert.equal(note.create('D').transposeDown('m3').name, 'B');
    });
  });

  describe('#toggleAccidental', function () {
    it('should toggle the accidental', function () {
      assert.equal(note.create('D#').toggleAccidental().name, 'Eb');
      assert.equal(note.create('Db').toggleAccidental().name, 'C#');
      assert.equal(note.create('Dbb').toggleAccidental().name, 'C');
      assert.equal(note.create('D##').toggleAccidental().name, 'E');
      assert.equal(note.create('Fb').toggleAccidental().name, 'E');
    });
  });

  describe('#enharmonic', function () {
    it('should return true if note is enharmonic to given note', function () {
      assert(note.create('Db').enharmonic('C#'));
      assert(note.create('D#').enharmonic('Eb'));
      assert(note.create('Cb').enharmonic('B'));
      assert(note.create('F##').enharmonic('G'));
    });
  });

  describe('#lowerThan', function () {
    it('should return true if note is lower than given note', function () {
      assert(note.create('D').lowerThan('G'));
      assert(note.create('Db').lowerThan('D'));
      assert(!note.create('D').lowerThan('Ebb'));
      assert(!note.create('D#').lowerThan('Eb'));
      assert(note.create('Cb').lowerThan('C'));
    });

    it('should handle octave numbers', function () {
      assert(note.create('D4').lowerThan('G4'));
      assert(note.create('G3').lowerThan('D4'));
      assert(note.create('D4').lowerThan('D5'));
      assert(!note.create('D5').lowerThan('G4'));
      assert(!note.create('D5').lowerThan('D5'));
      assert(note.create('Cb4').lowerThan('C4'));
    });
  });

  describe('#higherThan', function () {
    it('should return true if note is higher than given note', function () {
      assert(!note.create('D').higherThan('G'));
      assert(!note.create('Db').higherThan('D'));
      assert(!note.create('D').higherThan('Ebb'));
      assert(!note.create('D#').higherThan('Eb'));
    });

    it('should handle octave numbers', function () {
      assert(note.create('G4').higherThan('D4'));
      assert(note.create('D4').higherThan('G3'));
      assert(note.create('G5').higherThan('G4'));
      assert(!note.create('D5').higherThan('D5'));
    });
  });

  describe('#equals', function () {
    it('should return true if note is equal to given note', function () {
      assert(note.create('D').equals('D'));
      assert(note.create('D').eq('D'));
      assert(note.create('Ebb').equals('Ebb'));
      assert(!note.create('D').equals('Ebb'));
      assert(!note.create('C#').equals('Db'));
      assert(!note.create('F').equals('G'));
    });

    it('should handle octave numbers', function () {
      assert(note.create('G4').equals('G'));
      assert(note.create('G').equals('G4'));
      assert(note.create('G4').equals('G4'));
      assert(!note.create('G3').equals('G4'));
    });
  });

  describe('#random', function () {
    it('should return a random note in a given range', function () {
      var i;
      assert.equal(note.random(['C4', 'C4']).toString(), 'C4');

      for (i = 0; i < 100; i += 1) {
        assert(!note.random(['F4', 'G6']).lowerThan('F4'));
        assert(!note.random(['F4', 'G6']).higherThan('G6'));
      }

      assert.throws(function () {
        note.random(['G6', 'F4']);
      });
      assert.throws(function () {
        note.random(['F', 'G']);
      });
      assert.throws(function () {
        note.random(['F4', 'G']);
      });
      assert.throws(function () {
        note.random(['F', 'G4']);
      });
    });
  });

  describe('#getHalfSteps', function () {
    it('should return the number of half steps between two notes', function () {
      assert.equal(note.create('D').getHalfSteps('G'), 5);
      assert.equal(note.create('Gb').getHalfSteps('G#'), 2);
      assert.equal(note.create('G#').getHalfSteps('Gb'), 10);
      assert.equal(note.create('Cbb').getHalfSteps('E##'), 8);
    });
  });

  describe('#inRange', function () {
    it('should return true if a note is in a given range', function () {
      assert(note.create('D').inRange(['C', 'G']));
      assert(!note.create('A').inRange(['C', 'G']));
      assert(note.create('C').inRange(['C', 'G']));

      assert(note.create('D4').inRange(['C4', 'G4']));
      assert(note.create('C5').inRange(['C4', 'C6']));
      assert(!note.create('D4').inRange(['C3', 'G3']));

      assert(note.create('D').inRange(['C4', 'G4']));
      assert(!note.create('G').inRange(['C4', 'D4']));
    });
  });

  describe('#isNote', function () {
    it('should return true if an object is a note', function () {
      assert(note.isNote(note.create('C')));
      assert(!note.isNote('C'));
    });
  });

  describe('#inOctave', function () {
    it('should return note in given octave', function () {
      assert.equal(note.create('C').inOctave(4).octave, 4);
      assert.equal(note.create('C', 3).inOctave(4).octave, 4);
    });
  });

  describe('#withAccidental', function () {
    it('should return note with given accidental, if possible', function () {
      assert.equal(note.create('C#').withAccidental('b').name, 'Db');
      assert.equal(note.create('Db').withAccidental('#').name, 'C#');
      assert.equal(note.create('Cbb').withAccidental('b').name, 'Bb');
      assert.equal(note.create('Cbb').withAccidental('#').name, 'A#');
      assert.equal(note.create('Cb').withAccidental('n').name, 'B');
    });
    it('should return the same note otherwise', function () {
      assert.equal(note.create('C').withAccidental('b').name, 'C');
      assert.equal(note.create('Bbb').withAccidental('b').name, 'Bbb');
    });
  });

  describe('#value', function () {
    it('should return the note value', function () {
      assert.equal(note.create('C4').value(), 60);
      assert.equal(note.create('Eb3').value(), 51);
      assert.equal(note.create('Eb').value(), null);
    });
  });

  describe('#fromValue', function () {
    it('should create a note given a note value', function () {
      assert.equal(note.fromValue(60).fullName, 'C4');
      assert.equal(note.fromValue(52).fullName, 'E3');
    });
  });

  describe('#extract', function () {
    it('should extract a note name', function () {
      assert.equal(note.extract('Am7b5').fullName, 'A');
      assert.equal(note.extract('abc').fullName, 'Ab');
      assert.equal(note.extract('xyzc#5xyz').fullName, 'C#5');
      assert.equal(note.extract('Bsus4').fullName, 'B');
      assert.equal(note.extract('xdx').fullName, 'D##');
      assert.throws(function () {
        note.extract('xyz');
      });
    });
  });
});