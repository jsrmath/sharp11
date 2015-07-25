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
  });

  describe('#transpose', function () {
    it('should transpose a scale', function () {
      var s = scale.create('C', 'Whole Tone').transpose('P4');
      assert.equal(s.id, 'whole_tone');
      assert.equal(s.key.name, 'F');
      assert.equal(s.toString(), 'F G A B C# D#');
    });
  });
});