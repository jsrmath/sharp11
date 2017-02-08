var _ = require('underscore');
var jazz = require('../lib/jza');

var jza = jazz.jza();

var romanNumerals = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
var qualities = ['m', 'M', 'x', 'ø', 'o', 's'];

var numSamples = 5000;
var sizeDistribution = {"2":292,"3":265,"4":389,"5":104,"6":143,"7":112,"8":550,"9":328,"10":363,"11":279,"12":478,"13":278,"14":338,"15":233,"16":403,"17":190,"18":137,"19":92,"20":87,"21":59,"22":50,"23":50,"24":37,"25":21,"26":10,"27":10,"28":12,"29":13,"30":5,"31":5,"32":12,"33":5,"34":4,"35":3,"38":1,"39":1,"40":3,"41":3};
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
