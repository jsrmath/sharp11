var _ = require('underscore');
var jazz = require('../lib/jza');

var jza = jazz.jza();

var romanNumerals = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
var qualities = ['m', 'M', 'x', 'ø', 'o', 's'];

var numSamples = 5000;
var sizeDistribution = {"2":258,"3":241,"4":323,"5":81,"6":94,"7":68,"8":445,"9":263,"10":283,"11":215,"12":339,"13":207,"14":241,"15":189,"16":325,"17":150,"18":118,"19":80,"20":71,"21":52,"22":29,"23":39,"24":33,"25":19,"26":9,"27":9,"28":12,"29":9,"30":5,"31":4,"32":12,"33":6,"34":4,"35":3,"38":1,"39":1,"40":2,"41":2};
var sizeArray = [];

_.each(sizeDistribution, function (count, size) {
  _.each(_.range(count), function () {
    sizeArray.push(parseInt(size, 10));
  });
});

var sampleList = _.map(_.range(numSamples), function () {
  return _.map(_.range(_.sample(sizeArray)), function () {
    return jazz.symbolFromMehegan(_.sample(romanNumerals) + _.sample(qualities));
  });
});

var validSamples = _.filter(sampleList, function (sample) {
  return jza.validate(sample);
});

console.log(validSamples.length / numSamples);
