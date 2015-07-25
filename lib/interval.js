// interval.js

// Number to name map for interval
// 0 is not a valid interval number
var numberName = [null, 'Unison', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth',
  'Seventh', 'Octave', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth'];

// Quality to name map for interval
var qualityName = { 'M': 'Major', 'm': 'Minor', 'P': 'Perfect', 'dim': 'Diminished', 'aug': 'Augmented' };

var isPerfect = function (n) {
  return [1, 4, 5, 8, 11, 12].indexOf(n) > -1;
};

var rejectInvalidIntervals = function (number, quality) {
  var badPerfect = isPerfect(number) && ['M', 'm'].indexOf(quality) > -1;
  var badMajor = !isPerfect(number) && quality === 'P';

  if (badPerfect || badMajor) {
    throw new Error('Invalid interval: ' + quality + number);
  }
};

var handleAliases = function (quality) {
  quality = quality.replace(/^A$/, 'aug')
  quality = quality.replace(/^d$/, 'dim')
  quality = quality.replace(/^maj$/, 'M')
  quality = quality.replace(/^min$/, 'm')
  quality = quality.replace(/^perf$/, 'P');
  return quality;
};

// Parse a string and return an interval object
var parse = function (interval) {
  var quality = interval.replace(/\d/g, ''); // Remove digits
  var number = parseInt(interval.replace(/\D/g, ''), 10); // Remove non-digits

  if (!quality) { // No quality given, assume major or perfect
    quality = isPerfect(number) ? 'P' : 'M';
  }

  return new Interval(number, quality);
};

var Interval = function (number, quality) {
  quality = handleAliases(quality);
  rejectInvalidIntervals(number, quality);

  this.number = number;
  this.quality = quality;

  // Abbreviated interval name
  // Example: M6
  this.name = quality + number;

  // Full interval name
  // Example : Major Sixth
  this.fullName = qualityName[quality] + ' ' + numberName[number];

  this.toString = function () {
    return this.name;    
  };
};

module.exports.parse = parse;

module.exports.create = function (number, quality) {
  return new Interval(number, quality);
};