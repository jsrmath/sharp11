var improv = require('../lib/improv');
var note = require('../lib/note');
var chord = require('../lib/chord');
var duration = require('../lib/duration');
var charts = require('../sample/charts');

var assert = require('assert');

describe('Improv', function () {
  describe('#overChart', function () {
    it('should generate an improvisation', function () {
      var imp = improv.create().overChart(charts.myFunnyValentine);

      assert(imp.data[0].scale);
      assert(imp.data[0].chord);
      assert.equal(imp.data[0].notes.length, 4);
      assert.equal(imp.data[0].duration.beats, 4);
    });

    it.skip('should generate an improvisation within a given range', function () {
      var imp;
      var i;

      for (i = 0; i < 25; i += 1) {
        imp = improv.create({range: ['C4', 'C5']}).overChart(charts.myFunnyValentine);

        imp.data.forEach(function (obj) {
          obj.notes.forEach(function (arr) {
            arr.forEach(function (note) {
              if (note) {
                assert(!note.lowerThan('C4'));
                assert(!note.higherThan('C5'));
              }
            });
          });
        });
      }
    });

    it.skip('should terminate', function () {
      var imp;
      var i;

      for (i = 0; i < 50; i += 1) {
        imp = improv.create().overChart(charts.myFunnyValentine);
      }
    });

    it('should obey the `rests` setting', function () {
      var imp = improv.create({rests: 1}).overChart(charts.myFunnyValentine);
      var foundRest = false;

      imp.data.forEach(function (obj) {
        obj.notes.forEach(function (arr) {
          arr.forEach(function (note) {
            if (!note) foundRest = true;
          });
        });
      });

      assert(foundRest);

      imp = improv.create({cadence: false, rests: 0}).overChart(charts.myFunnyValentine);

      imp.data.forEach(function (obj) {
        obj.notes.forEach(function (arr) {
          arr.forEach(function (note) {
            assert(note);
          });
        });
      });
    });

    it('should obey the `rhythmicVariety` setting', function () {
      var imp = improv.create({rhythmicVariety: 0.5}).overChart(charts.myFunnyValentine);
      var found = [false, false, false];

      imp.data.forEach(function (obj) {
        obj.notes.forEach(function (arr) {
          found[arr.length - 2] = true;
        });
      });

      assert(found[0]);
      assert(found[1]);
      assert(found[2]);

      imp = improv.create({rhythmicVariety: 0}).overChart(charts.myFunnyValentine);

      imp.data.forEach(function (obj) {
        obj.notes.forEach(function (arr) {
          assert.equal(arr.length, 2);
        });
      });
    });

    it('should obey the `useSixteenths` setting', function () {
      var imp = improv.create({useSixteenths: true, rhythmicVariety: 0.5}).overChart(charts.myFunnyValentine);
      var found4;

      imp.data.forEach(function (obj) {
        obj.notes.forEach(function (arr) {
          if (arr.length === 4) found4 = true;
        });
      });

      assert(found4);

      imp = improv.create({useSixteenths: false, rhythmicVariety: 0.5}).overChart(charts.myFunnyValentine);

      imp.data.forEach(function (obj) {
        obj.notes.forEach(function (arr) {
          assert.notEqual(arr.length, 4);
        });
      });
    });

    it('should obey the `onlyEighthRests` setting', function () {
      var imp = improv.create({onlyEighthRests: true}).overChart(charts.myFunnyValentine);
      var foundRest = false;

      imp.data.forEach(function (obj) {
        obj.notes.forEach(function (arr) {
          if (arr.length !== 2) {
            assert.equal(arr.indexOf(null), -1);
          }
        });
      });
    });

    it('should obey the `sections` setting', function () {
      var imp = improv.create({cadence: false, sections: ['A']}).overChart(charts.myFunnyValentine);
      assert.equal(imp.data.length, 8);
    });

    it('should obey the `cadence` setting', function () {
      var imp = improv.create({cadence: true}).overChart(charts.takeTheATrain);
      assert.equal(imp.data.length, 8);
      assert.equal(imp.data[7].chord.name, 'C6');
      assert.equal(imp.data[7].notes.length, 1);
      assert.equal(imp.data[7].notes[0][1], null);
    });

    it('should obey the `repeat` setting', function () {
      var imp = improv.create({repeat: 2, cadence: false}).overChart(charts.takeTheATrain);
      assert.equal(imp.data.length, 14);

      imp = improv.create({repeat: 2, cadence: true}).overChart(charts.takeTheATrain);
      assert.equal(imp.data.length, 15);

      imp = improv.create({cadence: true, sections: ['A'], repeat: 2}).overChart(charts.myFunnyValentine);
      assert.equal(imp.data.length, 17);
    });
  });

  describe('ImprovChart', function () {
    describe('#notesAndDurations', function () {
      it('should return a list of notes and durations', function () {
        var imp = improv.create({rests: 0}).overChart(charts.myFunnyValentine);
        assert(note.isNote(imp.notesAndDurations()[0].note));
        assert(duration.isDuration(imp.notesAndDurations()[0].duration));
      });
    });

    describe('#chordsAndDurations', function () {
      it('should return a list of chords and durations', function () {
        var imp = improv.create({rests: 0}).overChart(charts.takeTheATrain);
        assert(chord.isChord(imp.chordsAndDurations()[0].chord));
        assert(duration.isDuration(imp.chordsAndDurations()[0].duration));
        assert.equal(imp.chordsAndDurations().length, 8);
      });
    });
  });
});