var chord = require('../lib/chord');

var assert = require('assert');
var _ = require('underscore');

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
      assert.equal(chord.create('C').symbol, '');
      assert.equal(chord.create('C').formattedSymbol, 'M');
      assert.equal(chord.create('Cmin').symbol, 'min');
      assert.equal(chord.create('Cmin').formattedSymbol, 'm');
      assert.equal(chord.create('Cmin').name, 'Cmin');
      assert.equal(chord.create('C∆7').toString(), 'C E G B');
      assert.equal(chord.create('Cmin').toString(), 'C Eb G');
      assert.equal(chord.create('Cdom7').toString(), 'C E G Bb');
      assert.equal(chord.create('CminMaj9#11').toString(), 'C Eb G B D F#');
      assert.equal(chord.create('Cmin(maj)7').toString(), 'C Eb G B');
      assert.equal(chord.create('Co').toString(), 'C Eb Gb');
      assert.equal(chord.create('C1/2dim').toString(), 'C Eb Gb Bb');
    });

    it('should handle basic chords', function () {
      assert.equal(chord.create('C').toString(), 'C E G');
      assert.equal(chord.create('Cm').toString(), 'C Eb G');
      assert.equal(chord.create('C6').toString(), 'C E G A');
      assert.equal(chord.create('C7').toString(), 'C E G Bb');
      assert.equal(chord.create('Cm7').toString(), 'C Eb G Bb');
      assert.equal(chord.create('CM7').toString(), 'C E G B');
      assert.equal(chord.create('CmM7').toString(), 'C Eb G B');
      assert.equal(chord.create('C+').toString(), 'C E G#');
      assert.equal(chord.create('C+7').toString(), 'C E G# Bb');
      assert.equal(chord.create('C+M7').toString(), 'C E G# B');
      assert.equal(chord.create('Cdim').toString(), 'C Eb Gb');
      assert.equal(chord.create('Cdim7').toString(), 'C Eb Gb Bbb');
      assert.equal(chord.create('Cø').toString(), 'C Eb Gb Bb');
      assert.equal(chord.create('Cø7').toString(), 'C Eb Gb Bb');
      assert.equal(chord.create('Csus4').toString(), 'C F G');
      assert.equal(chord.create('Csus2').toString(), 'C D G');
      assert.equal(chord.create('Csus47').toString(), 'C F G Bb');
      assert.equal(chord.create('C69').toString(), 'C E G A D');
      assert.equal(chord.create('Cn').toString(), 'C G');
      assert.equal(chord.create('Cno3').toString(), 'C G');
      assert.equal(chord.create('Cno5').toString(), 'C E');
      assert.equal(chord.create('C7no3').toString(), 'C G Bb');
      assert.equal(chord.create('C7no5').toString(), 'C E Bb');
      assert.equal(chord.create('C13no9').toString(), 'C E G Bb F A');
      assert.equal(chord.create('C13no11').toString(), 'C E G Bb D A');
      assert.equal(chord.create('C13no9no11').toString(), 'C E G Bb A');
    });

    it('should handle chords with alterations', function () {
      assert.equal(chord.create('Cm7b5').toString(), 'C Eb Gb Bb');
      assert.equal(chord.create('C7b9').toString(), 'C E G Bb Db');
      assert.equal(chord.create('C7#9').toString(), 'C E G Bb D#');
      assert.equal(chord.create('C7b9#9').toString(), 'C E G Bb Db D#');
      assert.equal(chord.create('C7#11').toString(), 'C E G Bb F#');
      assert.equal(chord.create('C13#11').toString(), 'C E G Bb D F# A');
    });

    it('should handle add chords', function () {
      assert.equal(chord.create('Cadd9').toString(), 'C E G D');
      assert.equal(chord.create('Cadd11').toString(), 'C E G F');
      assert.equal(chord.create('Cadd13').toString(), 'C E G A');

      assert.equal(chord.create('C7add9').toString(), 'C E G Bb D');
      assert.equal(chord.create('C7add11').toString(), 'C E G Bb F');
      assert.equal(chord.create('C7add13').toString(), 'C E G Bb A');

      assert.equal(chord.create('C9add11').toString(), 'C E G Bb D F');
      assert.equal(chord.create('C9add13').toString(), 'C E G Bb D A');

      assert.equal(chord.create('C11add13').toString(), 'C E G Bb D F A');
    });

    it('should handle parentheticals', function () {
      assert.equal(chord.create('Cmin(maj)7').toString(), 'C Eb G B');
      assert.equal(chord.create('C7(13)').toString(), 'C E G Bb A');
      assert.equal(chord.create('C7(#5, #9)').toString(), 'C E G# Bb D#');
      assert.equal(chord.create('C7(#9, 13)').toString(), 'C E G Bb D# A');
      assert.equal(chord.create('C7(9)(13)').toString(), 'C E G Bb D A');
      assert.equal(chord.create('Cm7(11)').toString(), 'C Eb G Bb F');
      assert.equal(chord.create('Cm(11)').toString(), 'C Eb G Bb F');
      assert.equal(chord.create('C(13)').toString(), 'C E G Bb A');
      assert.equal(chord.create('Cmin(maj)7(13)').toString(), 'C Eb G B A');
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

  describe('#transpose', function () {
    it('should transpose a chord', function () {
      var c = chord.create('F7').transpose('m3');
      assert.equal(c.name, 'Ab7');
      assert.equal(c.toString(), 'Ab C Eb Gb');

      c = chord.create('F7/A').transpose('m3');
      assert.equal(c.name, 'Ab7/C');
      assert.equal(c.toString(), 'C Eb Gb Ab');
    });

    it('should handle octave numbers', function () {
      var c = chord.create('F7', 4).transpose('P8');
      assert.equal(c.chord[0].fullName, 'F5');

      c = chord.create('F7/A', 4).transpose('P8');
      assert.equal(c.chord[0].fullName, 'A5');
      assert.equal(c.chord[3].fullName, 'F6');
    });

    it('should preserve original symbol', function () {
      assert.equal(chord.create('Fmin').transpose('P5').symbol, 'min');
      assert.equal(chord.create('Fmin/Eb').transpose('P5').name, 'Cmin/Bb');
    });
  });

  describe('#transposeDown', function () {
    it('should transpose a chord down', function () {
      var c = chord.create('C7').transposeDown('M3');
      assert.equal(c.name, 'Ab7');
      assert.equal(c.toString(), 'Ab C Eb Gb');
    });
  });

  describe('#clean', function () {
    it('should clean a chord', function () {
      var c = chord.create('C#+').clean();
      assert.equal(c.toString(), 'C# F A');

      c = chord.create('C#+/G##').clean();
      assert.equal(c.toString(), 'A C# F');

      c = chord.create('Cb').clean();
      assert.equal(c.root.name, 'B');
      assert.equal(c.toString(), 'B D# F#');

    });

    it('should preserve original symbol', function () {
      assert.equal(chord.create('Cbmin').clean().symbol, 'min');
    });
  });

  describe('#getPossibleChordNames', function () {
    it('should find chord names', function () {
      assert.deepEqual(chord.getPossibleChordNames('C', 'E', 'G'), ['C', 'Em/C', 'Gsus4/C']);
      assert.deepEqual(chord.getPossibleChordNames('F#', 'A#', 'D#'), ['D#m/F#', 'F#6', 'A#sus4/F#']);
    });

    it('should return reasonable names first', function () {
      assert.equal(chord.getPossibleChordNames('C', 'E', 'G')[0], 'C');
    });

    it('should only return unique matches', function () {
      assert.equal(chord.getPossibleChordNames('C', 'C', 'E', 'G')[0], 'C');
      assert.notEqual(chord.getPossibleChordNames('C', 'C', 'E', 'G')[1], 'C');
    });
  });

  describe('#getPossibleChordNamesFromArray', function () {
    it('should find chord names given an array', function () {
      assert.deepEqual(chord.getPossibleChordNamesFromArray(['C', 'E', 'G']), ['C', 'Em/C', 'Gsus4/C']);
    });
  });

  describe('#identify', function () {
    it('should identify a chord', function () {
      assert.equal(chord.identify('C', 'E', 'G'), 'C');
      assert.equal(chord.identify('C', 'Eb', 'G', 'B'), 'CmM7');
      assert.equal(chord.identify('B', 'D', 'F#', 'G#'), 'Bm6');
      assert.equal(chord.identify('D', 'A'), 'D5');
      assert.equal(chord.identify('D', 'G', 'A'), 'Dsus4');
      assert.equal(chord.identify('Eb', 'Bb'), 'Eb5');
      assert.equal(chord.identify('Eb', 'Bb', 'Db'), 'Eb7no3');
      assert.equal(chord.identify('C', 'Eb', 'Gb', 'A'), 'Cdim7');
      assert.equal(chord.identify('C', 'Eb', 'Gb', 'A', 'Bb'), 'Cm13b5');
      assert.equal(chord.identify('C', 'G'), 'C5');
    });

    it('should identify the proper inversion', function () {
      assert.equal(chord.identify('E', 'G', 'C'), 'C/E');
      assert.equal(chord.identify('E', 'G', 'Bb', 'C'), 'C7/E');
      assert.equal(chord.identify('F#', 'C', 'Eb', 'G', 'B', 'D'), 'CmM9#11/F#');
      assert.equal(chord.identify('Gb', 'C', 'Eb'), 'Cdim/Gb');
      assert.equal(chord.identify('E', 'G', 'Bb', 'C', 'D'), 'C9/E');
      assert.equal(chord.identify('E', 'G', 'B', 'C', 'D'), 'CM9/E');
    });

    it('should generally be the inverse of chord.create', function () {
      var testInverse = function (symbol) {
        return symbol === chord.identifyArray(chord.create(symbol).toString().split(' '));
      };

      var testInverseAndInversions = function (symbol) {
        var basses = chord.create(symbol).chord.slice(1);

        return _.every(basses, function (bass) {
          return testInverse(symbol + '/' + bass);
        });
      };

      assert(testInverseAndInversions('C'));
      assert(testInverseAndInversions('Cm'));
      assert(testInverseAndInversions('C7'));
      assert(testInverseAndInversions('CM7'));
      assert(testInverseAndInversions('CmM7'));
      assert(testInverseAndInversions('C7#5'));
      assert(testInverseAndInversions('Cdim'));
      assert(testInverseAndInversions('C5'));
      assert(testInverseAndInversions('C7no3'));
      assert(testInverseAndInversions('C9'));

      assert(testInverse('Cm6'));
      assert(testInverse('C6'));
      assert(testInverse('Cm7'));
      assert(testInverse('C+'));
      assert(testInverse('CM7#5'));
      assert(testInverse('Csus4'));
      assert(testInverse('Csus2'));
      assert(testInverse('Csus47'));
      assert(testInverse('C6/9'));
      assert(testInverse('Cm7b5'));
      assert(testInverse('C7b9'));
      assert(testInverse('C7#9'));
      assert(testInverse('C7#11'));
      assert(testInverse('C13#11'));
      assert(testInverse('C11'));
      assert(testInverse('C13'));
      assert(testInverse('Cadd9'));
      assert(testInverse('Cadd11'));
      assert(testInverse('C13#5#11'));
      assert(testInverse('C7b9#9'));
    });
  });

  describe('#identifyArray', function () {
    it('should identify a chord given an array', function () {
      assert.equal(chord.identifyArray(['C', 'E', 'G']), 'C');
      assert.equal(chord.identifyArray([], undefined));
    });
  });

  describe('#scales', function () {
    it('should produce scales for a given chord', function () {
      assert.equal(chord.create('C').scales()[0].id, 'major');
      assert.equal(chord.create('C').scales()[0].key.name, 'C');
      assert.equal(chord.create('C').scales().length, 11);

      assert.equal(chord.create('Cm').scales()[0].id, 'dorian');

      assert.equal(chord.create('Cm7b5').scales()[0].id, 'locrian');
      assert.equal(chord.create('Cdim7').scales()[0].id, 'diminished');
      assert.equal(chord.create('C+').scales()[0].id, 'whole_tone');

      assert.equal(chord.create('C').scales()[0].id, chord.create('C').scale().id);
    });

    it('should perform precedence optimizations', function () {
      assert(!_.some(chord.create('Cm9').scales(), function (scale) {
        return scale.id === 'bebop_dorian';
      }));

      assert(!_.some(chord.create('C9').scales(), function (scale) {
        return scale.id === 'bebop_dominant';
      }));

      assert(!_.some(chord.create('C6').scales(), function (scale) {
        return scale.id === 'mixolydian';
      }));

      assert.equal(chord.create('C7#11').scales()[2].id, 'blues');
    });

    it('should ignore octave numbers', function () {
      assert.equal(chord.create('C13', 4).scales().toString(), chord.create('C13').scales().toString());
    });
  });

  describe('#inOctave', function () {
    it('should assign octave numbers to a chord', function () {
      assert.equal(chord.create('C', 4).toString(), 'C4 E4 G4');

      assert.equal(chord.create('C').inOctave(4).toString(), 'C4 E4 G4');
      assert.equal(chord.create('G').inOctave(4).toString(), 'G4 B4 D5');
      assert.equal(chord.create('G/B').inOctave(4).toString(), 'B4 D5 G5');
      assert.equal(chord.create('G13').inOctave(4).toString(), 'G4 B4 D5 F5 A5 C6 E6');
    });
  });

  describe('#contains', function () {
    it('should return true if a chord contains a note', function () {
      assert(chord.create('C').contains('E'));
      assert(chord.create('C').contains('Fb'));
      assert(chord.create('C', 4).contains('E'));
      assert(chord.create('C').contains('E4'));
      assert(chord.create('C', 4).contains('E4'));
      assert(!chord.create('C', 5).contains('E4'));
      assert(!chord.create('C').contains('D'));
    });
  });

  describe('#hasInterval', function () {
    it('should return true if a chord contains a note', function () {
      assert(chord.create('C').hasInterval('M3'));
      assert(chord.create('C').hasInterval('dim4'));
      assert(chord.create('C', 4).hasInterval('M3'));
      assert(!chord.create('C').hasInterval('m3'));
    });
  });

  describe('#isChord', function () {
    it('should return true if an object is a chord', function () {
      assert(chord.isChord(chord.create('Cm7')));
      assert(!chord.isChord('Cm7'));
    });
  });
});
