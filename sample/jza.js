var _ = require('underscore');
var jazz = require('../lib/jza');

var jza = jazz.jza();

var romanNumerals = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
var qualities = ['m', 'M', 'x', 'ø'];

var numSamples = 5000;
var sizeDistribution = {"1":59,"2":225,"3":208,"4":283,"5":77,"6":119,"7":78,"8":430,"9":237,"10":287,"11":218,"12":358,"13":204,"14":233,"15":172,"16":274,"17":130,"18":97,"19":54,"20":56,"21":36,"22":40,"23":37,"24":30,"25":14,"26":6,"27":6,"28":6,"29":5,"30":1,"31":1,"32":7,"33":2,"34":3,"35":3,"38":1,"41":3};
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
