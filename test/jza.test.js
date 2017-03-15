var jazz = require('../lib/jza');

var assert = require('assert');
var _ = require('underscore');

describe('JzA', function () {
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

      assert.equal(jazz.symbolFromChord('C', 'Fsus').quality, 's');
      assert.equal(jazz.symbolFromChord('C', 'Fsus7b9').quality, 's');

      assert.throws(function () {
        jazz.symbolFromChord('C', 'min(maj)7');
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
      assert.equal(jazz.symbolFromMehegan('V').quality, 'x');
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

  describe('Symbol.toInterval', function () {
    it('should convert symbol to valid interval', function () {
      assert.equal(jazz.symbolFromMehegan('III').toInterval().toString(), 'M3');
      assert.equal(jazz.symbolFromMehegan('bIII').toInterval().toString(), 'm3');
      assert.equal(jazz.symbolFromMehegan('#III').toInterval().toString(), 'aug3');

      assert.equal(jazz.symbolFromMehegan('V').toInterval().toString(), 'P5');
      assert.equal(jazz.symbolFromMehegan('bV').toInterval().toString(), 'dim5');
      assert.equal(jazz.symbolFromMehegan('#V').toInterval().toString(), 'aug5');
    });
  });

  describe('Symbol.transpose', function () {
    it('should transpose a symbol', function () {
      assert.equal(jazz.symbolFromMehegan('Im').transpose('P4').toString(), 'IVm');
      assert.equal(jazz.symbolFromMehegan('I').transpose('m3').numeral, 'bIII');
      assert.equal(jazz.symbolFromMehegan('I').transpose('dim7').numeral, 'VI');
      assert.equal(jazz.symbolFromMehegan('bIII').transpose('dim5').numeral, 'VI');
      assert.equal(jazz.symbolFromMehegan('bIII').transpose('aug4').numeral, 'VI');
      assert.equal(jazz.symbolFromMehegan('I').transpose('aug1').numeral, '#I');
      assert.equal(jazz.symbolFromMehegan('I').transpose('m2').numeral, 'bII');
    });
  });

  describe('Symbol.transposeDown', function () {
    it('should transpose a symbol down', function () {
      assert.equal(jazz.symbolFromMehegan('Im').transposeDown('P4').toString(), 'Vm');
    });
  });

  describe('General JzA', function () {
    it('should create a new state', function () {
      var jza = jazz.jza('empty');
      var s = jza.addState('state');
      assert.equal(s.name, 'state');
      assert.equal(jza.getStatesByName('state').length, 1);
      assert.equal(jza.getStateByName('state').name, 'state');
    });

    it('should create transitions', function () {
      var jza = jazz.jza('empty');
      var tonic = jza.addState('tonic');
      var subdominant = jza.addState('subdominant');

      jza.addTransition(jazz.symbolFromMehegan('ii'), tonic, subdominant);
      tonic.addTransition(jazz.symbolFromMehegan('IV'), subdominant);

      _.each(jazz.symbolsFromMehegan(['ii', 'IV']), function (sym, i) {
        assert(tonic.transitions[i].symbol.eq(sym));
        assert.equal(tonic.transitions[i].from.name, 'tonic');
        assert.equal(tonic.transitions[i].to.name, 'subdominant');
        assert(tonic.hasTransition(sym, subdominant));
        assert(!subdominant.hasTransition(sym, tonic));
      });
    });

    it('should not create duplicate transitions', function () {
      var jza = jazz.jza('empty');
      var state1 = jza.addState('state1');
      var state2 = jza.addState('state2');

      state1.addTransition(jazz.symbolFromMehegan('#IVx'), state2);
      assert.equal(state1.transitions.length, 1);
      state1.addTransition(jazz.symbolFromMehegan('bVx'), state2);
      assert.equal(state1.transitions.length, 1);
    });

    it('should find transitions', function () {
      var jza = jazz.jza('empty');
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
      assert.equal(tonic.getNextStatesBySymbol(jazz.symbolFromMehegan('vi'))[0].name, 'subdominant');
    });

    it('should only end in an end state', function () {
      var jza = jazz.jza('empty');
      var start = jza.addState('start', true, false);
      var notEnd = jza.addState('not end', true, false);
      var end = jza.addState('end', true, true);
      var analysis;

      jza.addTransition(jazz.symbolFromMehegan('I'), start, notEnd);
      jza.addTransition(jazz.symbolFromMehegan('I'), start, end);

      analysis = jza.analyze(jazz.symbolsFromMehegan(['I']));

      assert.equal(analysis.length, 1);
      assert.equal(analysis[0][0].name, 'end');
    });

    it('should only start in a start state', function () {
      var jza = jazz.jza('empty');
      var initial = jza.addState('initial', false, true);
      var start = jza.addState('start', true, false);
      var notStart = jza.addState('start', false, false);
      var end = jza.addState('end', false, true);
      var analysis;

      jza.addTransition(jazz.symbolFromMehegan('I'), initial, start);
      jza.addTransition(jazz.symbolFromMehegan('I'), initial, notStart);
      jza.addTransition(jazz.symbolFromMehegan('IV'), start, end);
      jza.addTransition(jazz.symbolFromMehegan('IV'), notStart, end);

      analysis = jza.analyze(jazz.symbolsFromMehegan(['I', 'IV']));

      assert.equal(analysis.length, 1);
      assert.equal(analysis[0][0].name, 'start');
    });
  });

  describe('Default JzA', function () {
    var jza = jazz.jza();

    var analysisShouldBe = function (symbols, expected) {
      var analysis = _.chain(jza.analyze(jazz.symbolsFromMehegan(symbols)))
        .map(function (result) {
          return _.pluck(result, 'name').toString();
        })
        .uniq()
        .value();

      if (expected.length) assert(jza.validate(jazz.symbolsFromMehegan(symbols)));

      assert.equal(analysis.length, expected.length, analysis.join('\n'));

      expected = _.invoke(expected, 'toString');
      _.each(analysis, function (result, i) {
        assert(_.contains(expected, result), analysis.join('\n'));
      });
    };

    it('should have primitive transitions for functional states', function () {
      var jza = jazz.jza();
      var tonic = jza.getStateByName('Tonic');
      var subdominant = jza.getStateByName('Subdominant');
      var dominant = jza.getStateByName('Dominant');

      assert(tonic.hasTransition(jazz.symbolFromMehegan('ii'), subdominant));
      assert(subdominant.hasTransition(jazz.symbolFromMehegan('ii'), subdominant));
      assert(subdominant.hasTransition(jazz.symbolFromMehegan('V'), dominant));
      assert(dominant.hasTransition(jazz.symbolFromMehegan('V'), dominant));
      assert(dominant.hasTransition(jazz.symbolFromMehegan('I'), tonic));
      assert(tonic.hasTransition(jazz.symbolFromMehegan('I'), tonic));
    });

    it('should analyze a list of symbols', function () {
      analysisShouldBe(['iii', 'vi', 'ii', 'V', 'I'], [
        ['Tonic', 'Tonic', 'Subdominant', 'Dominant', 'Tonic'],
        ['Dominant', 'Tonic', 'Subdominant', 'Dominant', 'Tonic'],
        ['Tonic', 'Subdominant', 'Subdominant', 'Dominant', 'Tonic'],
        ['Tonic', 'Subdominant', 'Unpacked Vx', 'Dominant', 'Tonic']
      ]);

      analysisShouldBe(['iii', 'vi', 'ii', 'V', '#ivø'], []);
    });

    it('should validate a list of symbols', function () {      
      assert(jza.validate(jazz.symbolsFromMehegan(['iii', 'vi', 'ii', 'V', 'I'])));
      assert(!jza.validate(jazz.symbolsFromMehegan(['iii', 'vi', 'ii', 'V', '#ivø'])));
    });

    it('should handle tritone substitutions', function () {
      analysisShouldBe(['iii', 'bIIIx', 'ii', 'bIIx', 'I'], [
        ['Tonic', 'Tonic', 'Subdominant', 'Dominant', 'Tonic'],
        ['Dominant', 'Tonic', 'Subdominant', 'Dominant', 'Tonic'],
        ['Tonic', 'Subdominant', 'Subdominant', 'Dominant', 'Tonic'],
        ['Tonic', 'V / IIm', 'Subdominant', 'Dominant', 'Tonic'],
        ['ii / IIm', 'V / IIm', 'Subdominant', 'Dominant', 'Tonic']
      ]);

      analysisShouldBe(['iii', 'vi', 'ii', 'bIIm', 'I'], []);
    });

    it('should handle unpacked chords', function () {
      analysisShouldBe(['viim', 'IIIx', 'bviim', 'bIIIx'], [
        ['Unpacked IIIx', 'Tonic', 'Unpacked bIIIx', 'Tonic'],
        ['Unpacked IIIx', 'Tonic', 'Unpacked bIIIx', 'Subdominant'],
        ['Unpacked IIIx', 'Dominant', 'Unpacked bIIIx', 'Tonic']
      ]);

      analysisShouldBe(['ii', 'V', 'IV', 'bVIIx', 'I'], [
        ['Unpacked IIm', 'Subdominant', 'Subdominant', 'Dominant', 'Tonic']
      ]);

      analysisShouldBe(['ii', 'V'], [
        ['Subdominant', 'Dominant'],
        ['Unpacked IIm', 'Subdominant'],
        ['Unpacked Vx', 'Dominant']
      ]);
      
      analysisShouldBe(['im', 'ivm', 'viim', 'IIIx', 'bIIIM'], [
        ['Tonic', 'Subdominant', 'Unpacked IIIx', 'Dominant', 'Tonic']
      ]);
    });

    it('should handle tonicization', function () {
      analysisShouldBe(['ii', 'vm', 'Ix', 'IV'], [
        ['Subdominant', 'ii / IVM', 'V / IVM', 'Subdominant']
      ]);

      analysisShouldBe(['ii', 'viiø', 'IIIx', 'vi'], [
        ['Subdominant', 'ii / VIm', 'V / VIm', 'Subdominant']
      ]);
    });

    it('should handle applied chords', function () {
      analysisShouldBe(['I', 'VIIx', 'iii'], [
        ['Tonic', 'V / IIIm', 'Tonic'],
        ['Tonic', 'Subdominant', 'Dominant'] // TODO: I don't like that this is an option
      ]);

      analysisShouldBe(['IIIM', 'Vx', 'I'], [
        ['Tonic', 'V / IM', 'Tonic']
      ]);
    });

    it('should not unpack elaborated minor chords', function () {
      analysisShouldBe(['#ivø', 'VIIx', 'iii', 'VIx'], [
        ['ii / IIIm', 'V / IIIm', 'Tonic', 'Tonic'],
        ['ii / IIIm', 'V / IIIm', 'Dominant', 'Tonic'],
        ['ii / IIIm', 'V / IIIm', 'Tonic', 'Subdominant']
      ]);
    });

    it('should handle diminished chords', function () {
      analysisShouldBe(['I', '#Io', 'ii'], [
        ['Tonic', 'Tonic', 'Subdominant'],
        ['Tonic', 'Subdominant', 'Subdominant'],
        ['Tonic', 'V / IIm', 'Subdominant']
      ]);

      analysisShouldBe(['I', 'bIIIo', 'ii'], [
        ['Tonic', 'Diminished approaching IIm', 'Subdominant'],
      ]);
    });

    it('should handle packed subtonic cadences', function () {
      analysisShouldBe(['I', 'vi', 'IVm', 'I'], [
        ['Tonic', 'Subdominant', 'Dominant', 'Tonic']
      ]);
    });

    it('should handle neighbor chords', function () {
      analysisShouldBe(['V', 'I', 'IV', 'I', 'iii'], [
        ['Dominant', 'IM with neighbor', 'Neighbor of IM', 'Tonic', 'Tonic'],
        ['V / IM', 'IM with neighbor', 'Neighbor of IM', 'Tonic', 'Tonic']
      ]);

      analysisShouldBe(['IV', 'I'], []);
    });

    it('should handle diatonic passing chords', function () {
      analysisShouldBe(['I', 'ii', 'iii', 'IV'], [
        ['Tonic with passing chord', 'Passing chord', 'Tonic', 'Subdominant'],
        ['Tonic', 'Subdominant with passing chord', 'Passing chord', 'Subdominant']
      ]);

      analysisShouldBe(['iii', 'ii', 'I'], [
        ['Tonic with passing chord', 'Passing chord', 'Tonic']
      ]);
    });

    it('should handle sus chords', function () {
      analysisShouldBe(['Vs', 'I'], [
        ['Dominant', 'Tonic'],
        ['V / IM', 'Tonic']
      ]);
    });

    it('should handle chromatic approaching chords', function () {
      analysisShouldBe(['ii', 'IIIx', 'IV'], [
        ['Subdominant', 'Chromatic approaching IVM', 'Subdominant']
      ]);
    });

    it('should find a failure point iff there is one', function () {
      var failurePoint;

      failurePoint = jza.findFailurePoint(jazz.symbolsFromMehegan(['I', 'bIIø', 'IV']));
      assert(failurePoint);
      assert.equal(failurePoint.index, 2);
      assert.equal(failurePoint.symbol.toString(), 'IVM');
      assert.equal(failurePoint.previousStates[0].name, 'Neighbor of IM');
      assert(!failurePoint.invalidEndState);

      failurePoint = jza.findFailurePoint(jazz.symbolsFromMehegan(['I', 'bIIø']));
      assert(failurePoint);
      assert.equal(failurePoint.index, 1);
      assert.equal(failurePoint.symbol.toString(), 'bIIø');
      assert(failurePoint.invalidEndState);

      failurePoint = jza.findFailurePoint(jazz.symbolsFromMehegan(['ii', 'V', 'I']));
      assert.equal(failurePoint, null);
    });
  });
});