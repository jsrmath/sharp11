var dur = require('../lib/duration');

var assert = require('assert');

describe('Duration', function () {
  describe('#beats', function () {
    it('should create a note with a given number of beats', function () {
      var d = dur.beats(4);
      assert.equal(d.beats, 4);
      assert.equal(d.subunits.toString(), '');
      assert.equal(d.value(), 4);

      d = dur.beats();
      assert.equal(d.beats, 0);
    });
  });

  describe('#subunit', function () {
    it('should create a note with a given subunit', function () {
      var d = dur.subunit('eighth');
      assert.equal(d.beats, 0);
      assert.equal(d.subunits.toString(), 'eighth');
      assert.equal(d.value(), 0.5);
    });

    it('should reject an invalid subunit', function () {
      assert.throws(function () {
        dur.subunit('bad');
      });
    });

    it('should create a note with multiple subunits', function () {
      var d = dur.subunit('eighth', 'sixteenth');
      assert.equal(d.beats, 0);
      assert.equal(d.subunits.toString(), 'eighth,sixteenth');
      assert.equal(d.value(), 0.75);
    });

    it('should have proper values for valid subunits', function () {
      assert.equal(dur.subunit('eighth').value(), 0.5);
      assert.equal(dur.subunit('triplet').value(), 1/3);
      assert.equal(dur.subunit('sixteenth').value(), 0.25);
      assert.equal(dur.subunit('longEighth').value(), 1.5/2.5);
      assert.equal(dur.subunit('shortEighth').value(), 1/2.5);
      assert.equal(dur.subunit('longEighth').value(2), 2/3);
      assert.equal(dur.subunit('shortEighth').value(2), 1/3);
    });
  });

  describe('#addBeats', function () {
    it('should add beats to a duration', function () {
      var d = dur.beats(2);
      assert.equal(d.addBeats(3).beats, 5);
      assert.equal(d.addBeats(3).value(), 5);
      assert.equal(d.addBeats(3).subunits.toString(), '');
      assert.equal(d.beats, 2);
      assert.equal(d.value(), 2);
      assert.equal(d.subunits.toString(), '');

      d = dur.subunit('eighth', 'sixteenth');
      assert.equal(d.addBeats(2).beats, 2);
      assert.equal(d.addBeats(2).value(), 2.75);
      assert.equal(d.addBeats(3).subunits.toString(), 'eighth,sixteenth');
      assert.equal(d.beats, 0);
      assert.equal(d.value(), 0.75);
      assert.equal(d.subunits.toString(), 'eighth,sixteenth');
    });
  });

  describe('#addSubunit', function () {
    it('should add a subunit to a duration', function () {
      var d = dur.beats(2);
      assert.equal(d.addSubunit('eighth').beats, 2);
      assert.equal(d.addSubunit('eighth').value(), 2.5);
      assert.equal(d.addSubunit('eighth').subunits.toString(), 'eighth');
      assert.equal(d.beats, 2);
      assert.equal(d.value(), 2);
      assert.equal(d.subunits.toString(), '');

      d = dur.subunit('sixteenth');
      assert.equal(d.addSubunit('eighth').beats, 0);
      assert.equal(d.addSubunit('eighth').value(), 0.75);
      assert.equal(d.addSubunit('eighth').subunits.toString(), 'sixteenth,eighth');
      assert.equal(d.beats, 0);
      assert.equal(d.value(), 0.25);
      assert.equal(d.subunits.toString(), 'sixteenth');
    });

    it('should add multiple subunits to a duration', function () {
      var d = dur.beats(2);
      assert.equal(d.addSubunit('eighth', 'sixteenth').beats, 2);
      assert.equal(d.addSubunit('eighth', 'sixteenth').value(), 2.75);
      assert.equal(d.addSubunit('eighth', 'sixteenth').subunits.toString(), 'eighth,sixteenth');
      assert.equal(d.beats, 2);
      assert.equal(d.value(), 2);
      assert.equal(d.subunits.toString(), '');

      d = dur.subunit('triplet');
      assert.equal(d.addSubunit('eighth', 'sixteenth').beats, 0);
      assert.equal(d.addSubunit('eighth', 'sixteenth').value(), 0.75 + 1/3);
      assert.equal(d.addSubunit('eighth', 'sixteenth').subunits.toString(), 'triplet,eighth,sixteenth');
      assert.equal(d.beats, 0);
      assert.equal(d.value(), 1/3);
      assert.equal(d.subunits.toString(), 'triplet');
    });
  });

  describe('#merge', function () {
    it('should merge two durations', function () {
      var d = dur.beats(2).addSubunit('eighth').merge(dur.beats(3).addSubunit('sixteenth'));
      assert.equal(d.beats, 5);
      assert.equal(d.subunits.toString(), 'eighth,sixteenth');
      assert.equal(d.value(), 5.75);
    });
  });

  describe('#clean', function () {
    it('should combine redundant subunits', function () {
      var d = dur.beats(2).addSubunit(
        'eighth', 'eighth', 'eighth',
        'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth',
        'triplet', 'triplet', 'triplet', 'triplet', 'triplet',
        'longEighth', 'longEighth', 'longEighth',
        'shortEighth'
      );
      assert.equal(d.clean().beats, 6);
      assert.equal(d.clean().subunits.toString(), 'eighth,sixteenth,triplet,triplet,longEighth,longEighth');
      assert.equal(d.value(), d.clean().value());
    });
  });

  describe('#isDuration', function () {
    it('should return true iff a given object is a duration', function () {
      assert(dur.isDuration(dur.beats(4)));
      assert(!dur.isDuration(4));
    });
  });

  describe('#asDuration', function () {
    it('should coerce argument(s) into a proper duration', function () {
      var test = function (d, val) {
        assert(dur.isDuration(d));
        assert.equal(d.value(), val);
      };

      test(dur.asDuration(4), 4);
      test(dur.asDuration('eighth'), 0.5);
      test(dur.asDuration('eighth', 'sixteenth'), 0.75);
      test(dur.asDuration(dur.beats(4)), 4);
    });
  });
});