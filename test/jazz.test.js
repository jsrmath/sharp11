var jazz = require('../lib/jazz');

var assert = require('assert');
var _ = require('underscore');

describe('Jazz', function () {
  describe('symbolFromChord', function () {
    it('should create a valid symbol', function () {
      var symbol = jazz.symbolFromChord('C', 'F7');
      assert.equal(symbol.quality, 'x');
      assert.equal(symbol.interval, 5);
      assert.equal(symbol.numeral, 'IV');
      assert.equal(symbol.toString(), 'IVx');

      symbol = jazz.symbolFromChord('A', 'D7');
      assert.equal(symbol.quality, 'x');
      assert.equal(symbol.interval, 5);
      assert.equal(symbol.numeral, 'IV');
      assert.equal(symbol.toString(), 'IVx');
    });

    it('should handle various qualities', function () {
      assert.equal(jazz.symbolFromChord('C', 'F').quality, 'M');
      assert.equal(jazz.symbolFromChord('C', 'F6').quality, 'M');
      assert.equal(jazz.symbolFromChord('C', 'Fmaj7').quality, 'M');

      assert.equal(jazz.symbolFromChord('C', 'Fm').quality, 'm');
      assert.equal(jazz.symbolFromChord('C', 'Fm7').quality, 'm');
      assert.equal(jazz.symbolFromChord('C', 'Fm9').quality, 'm');
      assert.equal(jazz.symbolFromChord('C', 'FmM7').quality, 'm');

      assert.equal(jazz.symbolFromChord('C', 'F7').quality, 'x');
      assert.equal(jazz.symbolFromChord('C', 'F9').quality, 'x');

      assert.equal(jazz.symbolFromChord('C', 'Fdim').quality, 'o');
      assert.equal(jazz.symbolFromChord('C', 'Fdim7').quality, 'o');

      assert.equal(jazz.symbolFromChord('C', 'Fm7b5').quality, 'ø');
      assert.equal(jazz.symbolFromChord('C', 'F1/2dim7').quality, 'ø');

      assert.throws(function () {
        jazz.symbolFromChord('C', 'Fsus4');
      });
    });

    it('should handle various intervals', function () {
      assert.equal(jazz.symbolFromChord('C', 'Eb').numeral, 'bIII');
      assert.equal(jazz.symbolFromChord('C', 'A#').numeral, '#VI');
      assert.equal(jazz.symbolFromChord('C', 'F#').numeral, '#IV');
      assert.equal(jazz.symbolFromChord('C', 'Gb').numeral, 'bV');
      assert.equal(jazz.symbolFromChord('C#', 'Bb').numeral, 'VI');
    });
  });

  describe('symbolFromMehegan', function () {
    it('should create a valid symbol', function () {
      var symbol = jazz.symbolFromMehegan('IM');
      assert.equal(symbol.quality, 'M');
      assert.equal(symbol.interval, 0);
      assert.equal(symbol.numeral, 'I');
      assert.equal(symbol.toString(), 'IM');

      symbol = jazz.symbolFromMehegan('bIIIx');
      assert.equal(symbol.quality, 'x');
      assert.equal(symbol.interval, 3);
      assert.equal(symbol.numeral, 'bIII');
      assert.equal(symbol.toString(), 'bIIIx');

      symbol = jazz.symbolFromMehegan('iim');
      assert.equal(symbol.quality, 'm');
      assert.equal(symbol.interval, 2);
      assert.equal(symbol.numeral, 'II');
      assert.equal(symbol.toString(), 'IIm');

      assert.throws(function () {
        jazz.symbolFromMehegan('jk');
      });
    });

    it('should infer chord qualities', function () {
      assert.equal(jazz.symbolFromMehegan('I').quality, 'M');
      assert.equal(jazz.symbolFromMehegan('II').quality, 'm');
      assert.equal(jazz.symbolFromMehegan('VII').quality, 'ø');
      assert.equal(jazz.symbolFromMehegan('bIII').quality, 'm');
    });
  });

  describe('Symbol.eq', function () {
    it('should return true when two symbols are equivalent', function () {
      assert(jazz.symbolFromMehegan('I').eq(jazz.symbolFromChord('C', 'C')));
      assert(jazz.symbolFromMehegan('bVx').eq(jazz.symbolFromMehegan('#IVx')));
      assert(jazz.symbolFromChord('C', 'Fm').eq(jazz.symbolFromChord('C', 'Fm7')));
    });

    it('should return false when two symbols are not equivalent', function () {
      assert(!jazz.symbolFromMehegan('I').eq(jazz.symbolFromMehegan('Ix')));
      assert(!jazz.symbolFromMehegan('IVm').eq(jazz.symbolFromMehegan('Vm')));
    });
  });

  describe('jza', function () {
    it('should create a new state', function () {
      var jza = jazz.jza();
      var s = jza.addState('state');
      assert.equal(s.name, 'state');
    });

    it('should create transitions', function () {
      var jza = jazz.jza();
      var tonic = jza.addState('tonic');
      var subdominant = jza.addState('subdominant');

      jza.addTransition(jazz.symbolFromMehegan('ii'), tonic, subdominant);
      tonic.addTransition(jazz.symbolFromMehegan('IV'), subdominant);
      subdominant.addSource(jazz.symbolFromMehegan('vi'), tonic);

      _.each(['ii', 'IV', 'vi'], function (sym, i) {
        assert(tonic.transitions[i].symbol.eq(jazz.symbolFromMehegan(sym)));
        assert.equal(tonic.transitions[i].state.name, 'subdominant');
        assert(subdominant.sources[i].symbol.eq(jazz.symbolFromMehegan(sym)));
        assert.equal(subdominant.sources[i].state.name, 'tonic');
      });
    });

    it('should find transitions', function () {
      var jza = jazz.jza();
      var tonic = jza.addState('tonic');
      var subdominant = jza.addState('subdominant');
      var dominant = jza.addState('subdominant');

      jza.addTransition(jazz.symbolFromMehegan('vi'), tonic, subdominant);
      jza.addTransition(jazz.symbolFromMehegan('V'), subdominant, dominant);
      jza.addTransition(jazz.symbolFromMehegan('vi'), dominant, tonic);

      assert.equal(jza.getTransitions().length, 3);
      assert.equal(jza.getTransitions()[0].from.name, 'tonic');
      assert.equal(jza.getTransitions()[0].to.name, 'subdominant');

      assert.equal(jza.getTransitionsBySymbol(jazz.symbolFromMehegan('vi')).length, 2);
    });
  });
});