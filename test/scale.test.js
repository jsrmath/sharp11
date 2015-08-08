var scale = require('../lib/scale');

var assert = require('assert');

describe('Scale', function () {
  describe('#create', function () {
    it('should create a scale', function () {
      var s = scale.create('C', 'Major');
      assert.equal(s.name, 'Major');
      assert.equal(s.id, 'major');
      assert.equal(s.descending, false);
      assert.equal(s.key.name, 'C');
      assert.equal(s.toString(), 'C D E F G A B');
    });

    it('should create a descending scale', function () {
      var s = scale.create('C', 'Major', true);
      assert.equal(s.id, 'major');
      assert.equal(s.descending, true);
      assert.equal(s.key.name, 'C');
      assert.equal(s.toString(), 'C B A G F E D');
    });

    it('should create a descending melodic minor', function () {
      var s = scale.create('C', 'Melodic Minor', true);
      assert.equal(s.id, 'melodic_minor');
      assert.equal(s.descending, true);
      assert.equal(s.key.name, 'C');
      assert.equal(s.toString(), 'C Bb Ab G F Eb D');
    });

    it('should handle scale name aliases', function () {
      var s = scale.create('C', 'Half Whole');
      assert.equal(s.name, 'Half Whole');
      assert.equal(s.id, 'diminished');
      assert.equal(s.toString(), 'C Db Eb E Gb G A Bb');
    });
  });

  describe('#clean', function () {
    it('should clean the notes in a scale', function () {
      var s = scale.create('Db', 'Locrian');
      assert.equal(s.clean().toString(), 'Db D E Gb G A B');
      assert.equal(s.toString(), 'Db Ebb Fb Gb Abb Bbb Cb');
    });

    it('should clean the notes in a traversable scale', function () {
      var s = scale.create('Db', 'Locrian').traverse('Ebb4');
      assert.equal(s.clean().toString(), 'Db4 [D4] E4 Gb4 G4 A4 B4');
    });
  });

  describe('#transpose', function () {
    it('should transpose a scale', function () {
      var s = scale.create('C', 'Whole Tone').transpose('P4');
      assert.equal(s.id, 'whole_tone');
      assert.equal(s.key.name, 'F');
      assert.equal(s.toString(), 'F G A B C# D#');
    });

    it('should transpose a traversable scale', function () {
      var s = scale.create('C', 'Whole Tone').traverse('E4').transpose('P4');
      assert.equal(s.toString(), 'F4 G4 [A4] B4 C#5 D#5');
    });
  });

  describe('#traverse', function () {
    it('should create a traversable scale', function () {
      var s = scale.create('D', 'Major').traverse('G4');
      assert.equal(s.current().toString(), 'G4');
      assert.equal(s.scale.root.toString(), 'D4');

      s = scale.create('D7', 'Major').traverse('G4');
      assert.equal(s.scale.root.toString(), 'D4');

      s = scale.create('G', 'Major').traverse('D4');
      assert.equal(s.scale.root.toString(), 'G3');

      s = scale.create('C', 'Major').traverse('C4');
      assert.equal(s.scale.root.toString(), 'C4');
    });

    it('should throw errors when appropriate', function () {
      assert.throws(function () {
        s = scale.create('D', 'Major').traverse('G');
      });

      assert.throws(function () {
        s = scale.create('D', 'Major').traverse('C4');
      });
    });
  });

  describe('#shift', function () {
    it('should shift a traversable scale by a given number of steps', function () {
      var s = scale.create('D', 'Major').traverse('G4');

      assert.equal(s.shift(2).toString(), 'D4 E4 F#4 G4 A4 [B4] C#5');
      assert.equal(s.shift(9).toString(), 'D5 E5 F#5 G5 A5 [B5] C#6');

      assert.equal(s.shift(-2).toString(), 'D4 [E4] F#4 G4 A4 B4 C#5');
      assert.equal(s.shift(-9).toString(), 'D3 [E3] F#3 G3 A3 B3 C#4');

      assert.equal(s.shift(3).toString(), 'D4 E4 F#4 G4 A4 B4 [C#5]');
      assert.equal(s.shift(-3).toString(), '[D4] E4 F#4 G4 A4 B4 C#5');
      assert.equal(s.shift(0).toString(), 'D4 E4 F#4 [G4] A4 B4 C#5');
    });
  });

  describe('#shift', function () {
    it('should shift a traversable scale by a given number of steps', function () {
      var s = scale.create('D', 'Major').traverse('G4');

      assert.equal(s.shiftInterval('M3').toString(), 'D4 E4 F#4 G4 A4 [B4] C#5');
      assert.equal(s.shiftInterval('M10').toString(), 'D5 E5 F#5 G5 A5 [B5] C#6');

      assert.equal(s.shiftInterval('m3', true).toString(), 'D4 [E4] F#4 G4 A4 B4 C#5');
      assert.equal(s.shiftInterval('m10', true).toString(), 'D3 [E3] F#3 G3 A3 B3 C#4');

      assert.throws(function () {
        s.shiftInterval('m3');
      });
    });
  });

  describe('#random', function () {
    it('should set a traversable scale to a random note', function () {
      var s = scale.create('D', 'Major').traverse('G4');
      var original = s;

      while (s.current() === original.current()) s = s.random();

      assert.equal(s.scale.toString(), original.scale.toString());
      assert.notEqual(s.current(), original.current());
    });
  });

  describe('#nearest', function () {
    it('should return the nearest note in a scale to a given note', function () {
      var s = scale.create('D', 'Mixolydian');
      assert.equal(s.nearest('F#').name, 'F#');
      assert.equal(s.nearest('F').name, 'E');
      assert.equal(s.nearest('C#').name, 'C');

      assert.equal(scale.create('D4', 'Major').nearest('F').toString(), 'E4');

      assert.equal(scale.create('D', 'Major').nearest('F4').toString(), 'E4');
      assert.equal(scale.create('D', 'Major').nearest('C4').toString(), 'B3');
      assert.equal(scale.create('Db', 'Harmonic Minor').nearest('B4').toString(), 'C5');
    });

    it('should return the nearest note in a traversable scale to a given note', function () {
      var s = scale.create('D', 'Mixolydian').traverse('G4');
      assert.equal(s.nearest('F').name, 'E');
      assert.equal(s.nearest('F1').name, 'E');
    });
  });

  describe('#contains', function () {
    it('should return true if a scale contains a note', function () {
      assert(scale.create('C', 'Major').contains('F'));
      assert(scale.create('C', 'Major').contains('E#'));
      assert(scale.create('C4', 'Major').contains('F'));
      assert(scale.create('C', 'Major').contains('F4'));
      assert(scale.create('C4', 'Major').contains('F4'));
      assert(!scale.create('C5', 'Major').contains('F4'));
    });
  });

  describe('#isTraversable', function () {
    it('should return true if a scale is traversable', function () {
      assert(scale.isTraversable(scale.create('C').traverse('G4')));
      assert(!scale.isTraversable(scale.create('C')));
    });
  });
});