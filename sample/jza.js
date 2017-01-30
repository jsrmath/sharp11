var _ = require('underscore');
var jazz = require('../lib/jza');

var jza = jazz.jza();

var romanNumerals = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
var qualities = ['m', 'M', 'x', 'ø'];

var numSamples = 5000;
var numChordMin = 3;
var numChordMax = 8;

var sampleList = _.map(_.range(numSamples), function () {
  return _.map(_.range(_.sample(_.range(numChordMin, numChordMax))), function () {
    return jazz.symbolFromMehegan(_.sample(romanNumerals) + _.sample(qualities));
  });
});

var validSamples = _.filter(sampleList, function (sample) {
  return jza.validate(sample);
});

console.log(validSamples.length / numSamples);
