var _ = require('underscore');
var jazz = require('../lib/jza');

var jza = jazz.jza();

var romanNumerals = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
var qualities = ['m', 'M', 'x', 'ø', 'o', 's'];

var numSamples = 5000;
var sizeDistribution = {"2":267,"3":245,"4":373,"5":99,"6":137,"7":100,"8":503,"9":305,"10":338,"11":263,"12":430,"13":251,"14":310,"15":223,"16":367,"17":175,"18":130,"19":77,"20":80,"21":53,"22":45,"23":48,"24":34,"25":19,"26":10,"27":10,"28":7,"29":8,"30":3,"31":5,"32":9,"33":3,"34":4,"35":3,"38":1,"39":1,"41":3};
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
