var jazz = require('../lib/jza');

var assert = require('assert');
var _ = require('underscore');

var analysisShouldBeWithJza = function (jza, symbols, expected) {
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

  describe('Symbol.toChord', function () {
    it('should convert a symbol to a chord', function () {
      assert.equal(jazz.symbolFromMehegan('I').toChord('F').name, 'FM7');
      assert.equal(jazz.symbolFromMehegan('I').toChord().name, 'CM7');

      assert.equal(jazz.symbolFromMehegan('bIIM').toChord().name, 'DbM7');
      assert.equal(jazz.symbolFromMehegan('IIIm').toChord().name, 'Em7');
      assert.equal(jazz.symbolFromMehegan('IVx').toChord().name, 'F7');
      assert.equal(jazz.symbolFromMehegan('#IVø').toChord().name, 'F#ø');
      assert.equal(jazz.symbolFromMehegan('IVo').toChord().name, 'Fo7');
      assert.equal(jazz.symbolFromMehegan('Vs').toChord().name, 'G7sus');
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
      var initial = jza.addState('initial', false, true);
      var start = jza.addState('start', true, false);
      var end = jza.addState('end', false, true);
      var notEnd = jza.addState('not end', true, false);
      var analysis;

      jza.addTransition(jazz.symbolFromMehegan('I'), initial, start);
      jza.addTransition(jazz.symbolFromMehegan('IV'), start, end);
      jza.addTransition(jazz.symbolFromMehegan('IV'), start, notEnd);

      analysis = jza.analyze(jazz.symbolsFromMehegan(['I', 'IV']));

      assert.equal(analysis.length, 1);
      assert.equal(analysis[0][1].name, 'end');
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

    describe('when training data', function () {
      var jza = jazz.jza('empty');
      var initial = jza.addState('initial', false, false);
      var start1 = jza.addState('start1', true, false);
      var start2 = jza.addState('start2', true, false);
      var middle1 = jza.addState('middle1', false, false);
      var middle2 = jza.addState('middle2', false, false);
      var end1 = jza.addState('end1', false, true);
      var end2 = jza.addState('end2', false, true);

      var i_s1_I = jza.addTransition(jazz.symbolFromMehegan('I'), initial, start1);
      var i_s2_I = jza.addTransition(jazz.symbolFromMehegan('I'), initial, start2);
      var s1_m1_IV = jza.addTransition(jazz.symbolFromMehegan('IV'), start1, middle1);
      var s1_m2_V = jza.addTransition(jazz.symbolFromMehegan('V'), start1, middle2);
      var s2_m2_V = jza.addTransition(jazz.symbolFromMehegan('V'), start2, middle2);
      var m1_e1_V = jza.addTransition(jazz.symbolFromMehegan('V'), middle1, end1);
      var m1_e2_I = jza.addTransition(jazz.symbolFromMehegan('I'), middle1, end2);
      var m2_e1_I = jza.addTransition(jazz.symbolFromMehegan('I'), middle2, end1);

      analysisShouldBeWithJza(jza, ['I', 'IV', 'V'], [
        ['start1', 'middle1', 'end1']
      ]);

      analysisShouldBeWithJza(jza, ['I', 'IV', 'I'], [
        ['start1', 'middle1', 'end2']
      ]);
      
      analysisShouldBeWithJza(jza, ['I', 'V', 'I'], [
        ['start1', 'middle2', 'end1'],
        ['start2', 'middle2', 'end1']
      ]);

      jza.train([
        jazz.symbolsFromMehegan(['I', 'IV', 'V']), 
        jazz.symbolsFromMehegan(['I', 'IV', 'I']), 
        jazz.symbolsFromMehegan(['I', 'V', 'I'])
      ]);

      it('should produce proper counts', function () {
        assert.equal(i_s1_I.count, 0); // We currently don't keep track of initial transitions
        assert.equal(i_s2_I.count, 0); // We currently don't keep track of initial transitions
        assert.equal(s1_m1_IV.count, 2);
        assert.equal(s1_m2_V.count, 0.5);
        assert.equal(s2_m2_V.count, 0.5);
        assert.equal(m1_e1_V.count, 1);
        assert.equal(m1_e2_I.count, 1);
        assert.equal(m2_e1_I.count, 1);
      });

      it('should produce proper probabilities', function () {
        assert.equal(s1_m1_IV.getProbability(), 0.8);
        assert.equal(s1_m2_V.getProbability(), 0.2);
      });

      it('should produce probabilities of different states given a symbol', function () {
        var states = jza.getStateProbabilitiesGivenSymbol(jazz.symbolFromMehegan('V'));
        assert.equal(states.middle2, 0.5);
        assert.equal(states.end1, 0.5);

        // Currently, we don't add a count for initial transitions, which is why start1 and start2 are 0
        // Maybe change this
        states = jza.getStateProbabilitiesGivenSymbol(jazz.symbolFromMehegan('I'));
        assert.equal(states.end1, 0.5);
        assert.equal(states.end2, 0.5);
      });

      it('should serialize and load data', function () {
        json = jza.serialize();
        jza = jazz.jza('empty');
        jza.load(json);

        analysisShouldBeWithJza(jza, ['I', 'IV', 'V'], [
          ['start1', 'middle1', 'end1']
        ]);

        analysisShouldBeWithJza(jza, ['I', 'IV', 'I'], [
          ['start1', 'middle1', 'end2']
        ]);
        
        analysisShouldBeWithJza(jza, ['I', 'V', 'I'], [
          ['start1', 'middle2', 'end1'],
          ['start2', 'middle2', 'end1']
        ]);

        assert.equal(jza.getTransitionsBySymbol(jazz.symbolFromMehegan('IV'))[0].getProbability(), 0.8);
        assert.equal(jza.getTransitionsBySymbol(jazz.symbolFromMehegan('V'))[0].getProbability(), 0.2);
      });
    });
  });

  describe('Default JzA', function () {
    var jza = jazz.jza();
    var analysisShouldBe = _.partial(analysisShouldBeWithJza, jza); // Locally scoped version of function with common jza

    it('should have primitive transitions for functional states', function () {
      var tonic = jza.getStateByName('Tonic 1');
      var subdominant = jza.getStateByName('Subdominant 2');
      var dominant = jza.getStateByName('Dominant 5');

      assert(tonic.hasTransition(jazz.symbolFromMehegan('ii'), subdominant));
      assert(subdominant.hasTransition(jazz.symbolFromMehegan('ii'), subdominant));
      assert(subdominant.hasTransition(jazz.symbolFromMehegan('V'), dominant));
      assert(dominant.hasTransition(jazz.symbolFromMehegan('V'), dominant));
      assert(dominant.hasTransition(jazz.symbolFromMehegan('I'), tonic));
      assert(tonic.hasTransition(jazz.symbolFromMehegan('I'), tonic));
    });

    it('should analyze a list of symbols', function () {
      analysisShouldBe(['iii', 'vi', 'ii', 'V', 'I'], [
        ['Tonic 3', 'Tonic 6', 'Subdominant 2', 'Dominant 5', 'Tonic 1'],
        ['Dominant 3', 'Tonic 6', 'Subdominant 2', 'Dominant 5', 'Tonic 1'],
        ['Tonic 3', 'Subdominant 6', 'Subdominant 2', 'Dominant 5', 'Tonic 1'],
        ['Tonic 3', 'Subdominant 6', 'Unpacked Vx', 'Dominant 5', 'Tonic 1']
      ]);

      analysisShouldBe(['iii', 'vi', 'ii', 'V', '#ivø'], []);
    });

    it('should get pathways for a long list of symbols', function () {
      var sequence = ['ii', 'V', 'I'];
      var longSequence = [];

      _.times(40, function () {
        longSequence = longSequence.concat(sequence);
      });

      assert.equal(jza.getPathways(jazz.symbolsFromMehegan(longSequence)).length, 119);
    });

    it('should validate a list of symbols', function () {      
      assert(jza.validate(jazz.symbolsFromMehegan(['iii', 'vi', 'ii', 'V', 'I'])));
      assert(!jza.validate(jazz.symbolsFromMehegan(['iii', 'vi', 'ii', 'V', '#ivø'])));
    });

    it('should handle tritone substitutions', function () {
      analysisShouldBe(['iii', 'bIIIx', 'ii', 'bIIx', 'I'], [
        ['Tonic 3', 'Tonic b3', 'Subdominant 2', 'Dominant 5', 'Tonic 1'],
        ['Dominant 3', 'Tonic b3', 'Subdominant 2', 'Dominant 5', 'Tonic 1'],
        ['Tonic 3', 'Subdominant 6', 'Subdominant 2', 'Dominant 5', 'Tonic 1'],
        ['Tonic 3', 'V / IIm', 'Subdominant 2', 'Dominant 5', 'Tonic 1'],
        ['ii / IIm', 'V / IIm', 'Subdominant 2', 'Dominant 5', 'Tonic 1']
      ]);

      analysisShouldBe(['iii', 'vi', 'ii', 'bIIm', 'I'], []);
    });

    it('should handle unpacked chords', function () {
      analysisShouldBe(['viim', 'IIIx', 'bviim', 'bIIIx'], [
        ['Unpacked IIIx', 'Tonic 3', 'Unpacked bIIIx', 'Tonic b3'],
        ['Unpacked IIIx', 'Tonic 3', 'Unpacked bIIIx', 'Subdominant 6'],
        ['Unpacked IIIx', 'Dominant 3', 'Unpacked bIIIx', 'Tonic b3']
      ]);

      analysisShouldBe(['ii', 'V', 'IV', 'bVIIx', 'I'], [
        ['Unpacked IIm', 'Subdominant 2', 'Subdominant 4', 'Dominant b7', 'Tonic 1']
      ]);

      analysisShouldBe(['ii', 'V'], [
        ['Subdominant 2', 'Dominant 5'],
        ['Unpacked IIm', 'Subdominant 2'],
        ['Unpacked Vx', 'Dominant 5']
      ]);
      
      analysisShouldBe(['im', 'ivm', 'viim', 'IIIx', 'bIIIM'], [
        ['Tonic 1', 'Subdominant 4', 'Unpacked IIIx', 'Dominant 3', 'Tonic b3']
      ]);
    });

    it('should handle tonicization', function () {
      analysisShouldBe(['ii', 'vm', 'Ix', 'IV'], [
        ['Subdominant 2', 'ii / IVM', 'V / IVM', 'Subdominant 4']
      ]);

      analysisShouldBe(['ii', 'viiø', 'IIIx', 'vi'], [
        ['Subdominant 2', 'ii / VIm', 'V / VIm', 'Subdominant 6']
      ]);
    });

    it('should handle applied chords', function () {
      analysisShouldBe(['I', 'VIIx', 'iii'], [
        ['Tonic 1', 'V / IIIm', 'Tonic 3'],
        ['Tonic 1', 'Subdominant 4', 'Dominant 3'] // TODO: I don't like that this is an option
      ]);

      analysisShouldBe(['IIIM', 'Vx', 'I'], [
        ['Tonic 3', 'V / IM', 'Tonic 1']
      ]);
    });

    it('should not unpack elaborated minor chords', function () {
      analysisShouldBe(['#ivø', 'VIIx', 'iii', 'VIx'], [
        ['ii / IIIm', 'V / IIIm', 'Tonic 3', 'Tonic 6'],
        ['ii / IIIm', 'V / IIIm', 'Dominant 3', 'Tonic 6'],
        ['ii / IIIm', 'V / IIIm', 'Tonic 3', 'Subdominant 6']
      ]);
    });

    it('should handle diminished chords', function () {
      analysisShouldBe(['I', '#Io', 'ii'], [
        ['Tonic 1', 'Tonic 6', 'Subdominant 2'],
        ['Tonic 1', 'Subdominant 6', 'Subdominant 2'],
        ['Tonic 1', 'V / IIm', 'Subdominant 2']
      ]);

      analysisShouldBe(['I', 'bIIIo', 'ii'], [
        ['Tonic 1', 'Diminished approaching IIm', 'Subdominant 2'],
      ]);
    });

    it('should handle packed subtonic cadences', function () {
      analysisShouldBe(['I', 'vi', 'IVm', 'I'], [
        ['Tonic 1', 'Subdominant 6', 'Dominant 4', 'Tonic 1']
      ]);
    });

    it('should handle neighbor chords', function () {
      analysisShouldBe(['V', 'I', 'IV', 'I', 'iii'], [
        ['Dominant 5', 'IM with neighbor', 'Neighbor of IM', 'Tonic 1', 'Tonic 3'],
        ['V / IM', 'IM with neighbor', 'Neighbor of IM', 'Tonic 1', 'Tonic 3']
      ]);

      analysisShouldBe(['IV', 'I'], []);
    });

    it('should handle diatonic passing chords', function () {
      analysisShouldBe(['I', 'ii', 'iii', 'IV'], [
        ['Tonic with passing chord', 'Passing chord', 'Tonic 3', 'Subdominant 4'],
        ['Tonic 1', 'Subdominant with passing chord', 'Passing chord', 'Subdominant 4']
      ]);

      analysisShouldBe(['iii', 'ii', 'I'], [
        ['Tonic with passing chord', 'Passing chord', 'Tonic 1']
      ]);
    });

    it('should handle sus chords', function () {
      analysisShouldBe(['Vs', 'I'], [
        ['Dominant 5', 'Tonic 1'],
        ['V / IM', 'Tonic 1']
      ]);
    });

    it('should handle chromatic approaching chords', function () {
      analysisShouldBe(['ii', 'IIIx', 'IV'], [
        ['Subdominant 2', 'Chromatic approaching IVM', 'Subdominant 4']
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