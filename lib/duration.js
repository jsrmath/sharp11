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

Duration.prototype.merge = function (dur) {
  return new Duration(this.beats + dur.beats, this.subunits.concat(dur.subunits));
};

// Merge subunits as possible
Duration.prototype.clean = function () {
  var subunitCounts = _.countBy(this.subunits);
  var beats = this.beats;
  var subunits;
  var beatsToAdd;

  // Merge sixteenths
  if (subunitCounts.sixteenth) {
    subunitCounts.eighth = (subunitCounts.eighth || 0) + Math.floor(subunitCounts.sixteenth / 2);
    subunitCounts.sixteenth = subunitCounts.sixteenth % 2;
  }

  // Merge triplets
  if (subunitCounts.triplet) {
    beats += Math.floor(subunitCounts.triplet / 3);
    subunitCounts.triplet = subunitCounts.triplet % 3;
  }

  // Merge regular eighths
  if (subunitCounts.eighth) {
    beats += Math.floor(subunitCounts.eighth / 2);
    subunitCounts.eighth = subunitCounts.eighth % 2;
  }

  // Merge long and short eighths
  if (subunitCounts.longEighth && subunitCounts.shortEighth) {
    beatsToAdd = Math.min(subunitCounts.longEighth, subunitCounts.shortEighth);
    subunitCounts.longEighth -= beatsToAdd;
    subunitCounts.shortEighth -= beatsToAdd;
    beats += beatsToAdd;
  }

  // Convert counts back into array
  subunits = _.reduce(subunitCounts, function (arr, count, subunit) {
    _.times(count, function () {
      arr.push(subunit);
    });
    return arr;
  }, []);

  return new Duration(beats, subunits);
};

module.exports.Duration = Duration;

module.exports.beats = function (beats) {
  return new Duration(beats);
};

module.exports.subunit = function () {
  return new Duration(0, _.toArray(arguments));
};

module.exports.isDuration = function (dur) {
  return dur instanceof Duration;
};

module.exports.asDuration = function (obj) {
  if (obj instanceof Duration) return obj;
  if (typeof obj === 'number') return new Duration(obj);
  return new Duration(0, _.toArray(arguments));
};
