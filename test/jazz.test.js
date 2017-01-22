var jazz = require('../lib/jazz');

var assert = require('assert');

describe('Jazz', function () {
  describe('Symbol', function () {
    it('should create a valid symbol', function () {
      var symbol = new jazz.Symbol('C', 'F7');
      assert.equal(symbol.quality, 'x');
      assert.equal(symbol.interval, 5);
      assert.equal(symbol.numeral, 'IV');
      assert.equal(symbol.toString(), 'IVx');

      symbol = new jazz.Symbol('A', 'D7');
      assert.equal(symbol.quality, 'x');
      assert.equal(symbol.interval, 5);
      assert.equal(symbol.numeral, 'IV');
      assert.equal(symbol.toString(), 'IVx');
    });

    it('should handle various qualities', function () {
      assert.equal(new jazz.Symbol('C', 'F').quality, 'M');
      assert.equal(new jazz.Symbol('C', 'F6').quality, 'M');
      assert.equal(new jazz.Symbol('C', 'Fmaj7').quality, 'M');

      assert.equal(new jazz.Symbol('C', 'Fm').quality, 'm');
      assert.equal(new jazz.Symbol('C', 'Fm7').quality, 'm');
      assert.equal(new jazz.Symbol('C', 'Fm9').quality, 'm');
      assert.equal(new jazz.Symbol('C', 'FmM7').quality, 'm');

      assert.equal(new jazz.Symbol('C', 'F7').quality, 'x');
      assert.equal(new jazz.Symbol('C', 'F9').quality, 'x');

      assert.equal(new jazz.Symbol('C', 'Fdim').quality, 'o');
      assert.equal(new jazz.Symbol('C', 'Fdim7').quality, 'o');

      assert.equal(new jazz.Symbol('C', 'Fm7b5').quality, 'ø');
      assert.equal(new jazz.Symbol('C', 'F1/2dim7').quality, 'ø');

      assert.equal(new jazz.Symbol('C', 'Fsus4').quality, null);
    });

    it('should handle various intervals', function () {
      assert.equal(new jazz.Symbol('C', 'Eb').numeral, 'bIII');
      assert.equal(new jazz.Symbol('C', 'A#').numeral, '#VI');
      assert.equal(new jazz.Symbol('C', 'F#').numeral, '#IV');
      assert.equal(new jazz.Symbol('C', 'Gb').numeral, 'bV');
      assert.equal(new jazz.Symbol('C#', 'Bb').numeral, 'VI');
    });
  });
});