var mehegan = require('../lib/mehegan');

var assert = require('assert');
var _ = require('underscore');

describe('Mehegan', function () {
  describe('#fromChord', function () {
    it('should create a valid Mehegan symbol', function () {
      var symbol = mehegan.fromChord('C', 'F7');
      assert.equal(symbol.quality, 'x');
      assert.equal(symbol.interval, 5);
      assert.equal(symbol.numeral, 'IV');
      assert.equal(symbol.toString(), 'IVx');

      symbol = mehegan.fromChord('A', 'D7');
      assert.equal(symbol.quality, 'x');
      assert.equal(symbol.interval, 5);
      assert.equal(symbol.numeral, 'IV');
      assert.equal(symbol.toString(), 'IVx');
    });

    it('should handle various qualities', function () {
      assert.equal(mehegan.fromChord('C', 'F').quality, 'M');
      assert.equal(mehegan.fromChord('C', 'F6').quality, 'M');
      assert.equal(mehegan.fromChord('C', 'Fmaj7').quality, 'M');

      assert.equal(mehegan.fromChord('C', 'Fm').quality, 'm');
      assert.equal(mehegan.fromChord('C', 'Fm7').quality, 'm');
      assert.equal(mehegan.fromChord('C', 'Fm9').quality, 'm');
      assert.equal(mehegan.fromChord('C', 'FmM7').quality, 'm');

      assert.equal(mehegan.fromChord('C', 'F7').quality, 'x');
      assert.equal(mehegan.fromChord('C', 'F9').quality, 'x');

      assert.equal(mehegan.fromChord('C', 'Fdim').quality, 'o');
      assert.equal(mehegan.fromChord('C', 'Fdim7').quality, 'o');

      assert.equal(mehegan.fromChord('C', 'Fm7b5').quality, 'ø');
      assert.equal(mehegan.fromChord('C', 'F1/2dim7').quality, 'ø');

      assert.equal(mehegan.fromChord('C', 'Fsus').quality, 's');
      assert.equal(mehegan.fromChord('C', 'Fsus7b9').quality, 's');

      assert.throws(function () {
        mehegan.fromChord('C', 'min(maj)7');
      });
    });

    it('should handle various intervals', function () {
      assert.equal(mehegan.fromChord('C', 'Eb').numeral, 'bIII');
      assert.equal(mehegan.fromChord('C', 'A#').numeral, '#VI');
      assert.equal(mehegan.fromChord('C', 'F#').numeral, '#IV');
      assert.equal(mehegan.fromChord('C', 'Gb').numeral, 'bV');
      assert.equal(mehegan.fromChord('C#', 'Bb').numeral, 'VI');
    });
  });

  describe('#fromChords', function () {
    it('should create Mehegan symbols from chords', function () {
      var symbols = mehegan.fromChords('F', ['F7', 'C7']);
      assert.equal(symbols[0].numeral, 'I');
      assert.equal(symbols[1].numeral, 'V');
    });
  });

  describe('#fromString', function () {
    it('should create a valid Mehegan symbol', function () {
      var symbol = mehegan.fromString('IM');
      assert.equal(symbol.quality, 'M');
      assert.equal(symbol.interval, 0);
      assert.equal(symbol.numeral, 'I');
      assert.equal(symbol.toString(), 'IM');

      symbol = mehegan.fromString('bIIIx');
      assert.equal(symbol.quality, 'x');
      assert.equal(symbol.interval, 3);
      assert.equal(symbol.numeral, 'bIII');
      assert.equal(symbol.toString(), 'bIIIx');

      symbol = mehegan.fromString('iim');
      assert.equal(symbol.quality, 'm');
      assert.equal(symbol.interval, 2);
      assert.equal(symbol.numeral, 'II');
      assert.equal(symbol.toString(), 'IIm');

      assert.throws(function () {
        mehegan.fromString('jk');
      });
    });

    it('should infer chord qualities', function () {
      assert.equal(mehegan.fromString('I').quality, 'M');
      assert.equal(mehegan.fromString('II').quality, 'm');
      assert.equal(mehegan.fromString('V').quality, 'x');
      assert.equal(mehegan.fromString('VII').quality, 'ø');
      assert.equal(mehegan.fromString('bIII').quality, 'm');
    });
  });

  describe('#fromStrings', function () {
    it('should create Mehegan symbols from chords', function () {
      var symbols = mehegan.fromStrings(['Ix', 'Vx']);
      assert.equal(symbols[0].numeral, 'I');
      assert.equal(symbols[1].numeral, 'V');
    });
  });

  describe('#equals', function () {
    it('should return true when two Mehegan symbols are equivalent', function () {
      assert(mehegan.fromString('I').equals(mehegan.fromChord('C', 'C')));
      assert(mehegan.fromString('I').eq(mehegan.fromChord('C', 'C')));
      assert(mehegan.fromString('bVx').eq(mehegan.fromString('#IVx')));
      assert(mehegan.fromChord('C', 'Fm').eq(mehegan.fromChord('C', 'Fm7')));
      assert(mehegan.fromString('bVx').eq('#IVx'));
    });

    it('should return false when two Mehegan symbols are not equivalent', function () {
      assert(!mehegan.fromString('I').eq(mehegan.fromString('Ix')));
      assert(!mehegan.fromString('IVm').eq(mehegan.fromString('Vm')));
      assert(!mehegan.fromString('IVm').eq('Vm'));
    });
  });

  describe('#asMehegan', function () {
    it('should return a Mehegan symbol', function () {
      assert.equal(mehegan.asMehegan('Vm').numeral, 'V');
      assert.equal(mehegan.asMehegan(mehegan.fromString('Vm')).numeral, 'V');
    });

    it('should use a cache when one is provided', function () {
      var cache = {};
      assert(!cache.Vm);
      assert.equal(mehegan.asMehegan('Vm', cache).numeral, 'V');
      assert(cache.Vm);
    });
  });

  describe('#asMeheganArray', function () {
    it('should use a cache when one is provided', function () {
      var cache = {};
      assert(!cache.Vm);
      assert(!cache.IVx);
      assert.equal(_.pluck(mehegan.asMeheganArray(['Vm', 'IVx'], cache), 'numeral').toString(), 'V,IV');
      assert(cache.Vm);
      assert(cache.IVx);
    });
  });

  describe('#toInterval', function () {
    it('should convert Mehegan symbol to valid interval', function () {
      assert.equal(mehegan.fromString('III').toInterval().toString(), 'M3');
      assert.equal(mehegan.fromString('bIII').toInterval().toString(), 'm3');
      assert.equal(mehegan.fromString('#III').toInterval().toString(), 'aug3');

      assert.equal(mehegan.fromString('V').toInterval().toString(), 'P5');
      assert.equal(mehegan.fromString('bV').toInterval().toString(), 'dim5');
      assert.equal(mehegan.fromString('#V').toInterval().toString(), 'aug5');
    });
  });

  describe('#transpose', function () {
    it('should transpose a Mehegan symbol', function () {
      assert.equal(mehegan.fromString('Im').transpose('P4').toString(), 'IVm');
      assert.equal(mehegan.fromString('I').transpose('m3').numeral, 'bIII');
      assert.equal(mehegan.fromString('I').transpose('dim7').numeral, 'VI');
      assert.equal(mehegan.fromString('bIII').transpose('dim5').numeral, 'VI');
      assert.equal(mehegan.fromString('bIII').transpose('aug4').numeral, 'VI');
      assert.equal(mehegan.fromString('I').transpose('aug1').numeral, '#I');
      assert.equal(mehegan.fromString('I').transpose('m2').numeral, 'bII');
    });
  });

  describe('#transposeDown', function () {
    it('should transpose a Mehegan symbol down', function () {
      assert.equal(mehegan.fromString('Im').transposeDown('P4').toString(), 'Vm');
    });
  });

  describe('#toChord', function () {
    it('should convert a Mehegan symbol to a chord', function () {
      assert.equal(mehegan.fromString('I').toChord('F').name, 'FM7');
      assert.equal(mehegan.fromString('I').toChord().name, 'CM7');

      assert.equal(mehegan.fromString('bIIM').toChord().name, 'DbM7');
      assert.equal(mehegan.fromString('IIIm').toChord().name, 'Em7');
      assert.equal(mehegan.fromString('IVx').toChord().name, 'F7');
      assert.equal(mehegan.fromString('#IVø').toChord().name, 'F#ø');
      assert.equal(mehegan.fromString('IVo').toChord().name, 'Fo7');
      assert.equal(mehegan.fromString('Vs').toChord().name, 'G7sus');
    });
  });

  describe('#toStylized', function () {
    it('should convert a Mehegan symbol to a stylized string', function () {
      assert.equal(mehegan.fromString('IM').toStylized(), 'I');
      assert.equal(mehegan.fromString('IIm').toStylized(), 'ii');
      assert.equal(mehegan.fromString('IIIm').toStylized(), 'iii');
      assert.equal(mehegan.fromString('IVM').toStylized(), 'IV');
      assert.equal(mehegan.fromString('Vx').toStylized(), 'V');
      assert.equal(mehegan.fromString('VIm').toStylized(), 'vi');
      assert.equal(mehegan.fromString('VIIø').toStylized(), 'vii');

      assert.equal(mehegan.fromString('Im').toStylized(), 'im');
      assert.equal(mehegan.fromString('Ix').toStylized(), 'Ix');
      assert.equal(mehegan.fromString('Io').toStylized(), 'io');
      assert.equal(mehegan.fromString('Iø').toStylized(), 'iø');
      assert.equal(mehegan.fromString('Is').toStylized(), 'Is');
    });
  });
});