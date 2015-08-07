var improv = require('../lib/improv');
var charts = require('../sample/charts');

var assert = require('assert');

describe('Improvisor', function () {
  describe('#overChart', function () {
    it('should generate an improvisation', function () {
      var imp = improv.create().over('chart', charts.myFunnyValentine);

      assert(imp[0].scale);
      assert(imp[0].chord);
      assert(imp[0].notes.length, 4);
    });

    it('should generate an improvisation within a given range', function () {
      var imp;
      var i;

      for (i = 0; i < 25; i += 1) {
        imp = improv.create({range: ['C4', 'C5']}).over('chart', charts.myFunnyValentine);

        imp.forEach(function (obj) {
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

    it('should terminate', function () {
      var imp;
      var i;

      for (i = 0; i < 50; i += 1) {
        imp = improv.create().over('chart', charts.myFunnyValentine);
      }
    });
  });
});