// duration.js

var _ = require('underscore');

// A duration must have either a number of beats or an array of subunits, and it can have both
// e.g. new Duration(2, ['eighth', 'sixteenth']) is a half note tied to a dotted eighth
var Duration = function (beats, subunits) {
  // Number of beats
  this.beats = beats || 0;

  // Acceptable values: sixteenth, eighth, longEighth, shortEighth, triplet
  this.subunits = subunits || [];

  _.each(this.subunits, function (subunit) {
    if (!_.contains(['sixteenth', 'eighth', 'longEighth', 'shortEighth', 'triplet'], subunit)) {
      throw new Error('Invalid duration subunit: ' + subunit);
    }
  });
};

// Total number of beats given optional swing ratio
Duration.prototype.value = function (swingRatio) {
  swingRatio = swingRatio || 1.5;

  return _.reduce(this.subunits, function (value, subunit) {
    switch (subunit) {
      case 'longEighth':
        return value + swingRatio / (swingRatio + 1);
      case 'shortEighth':
        return value + 1 / (swingRatio + 1);
      case 'eighth':
        return value + 0.5;
      case 'triplet':
        return value + 1/3;
      case 'sixteenth':
        return value + 0.25;
      default:
        return value;
    }
  }, this.beats);
};

Duration.prototype.addBeats = function (beats) {
  return new Duration(this.beats + beats, this.subunits);
};

Duration.prototype.addSubunit = function () {
  return new Duration(this.beats, this.subunits.concat(_.toArray(arguments)));
};

module.exports.Duration = Duration;

module.exports.beats = function (beats) {
  return new Duration(beats);
};

module.exports.subunit = function () {
  return new Duration(0, _.toArray(arguments));
};
