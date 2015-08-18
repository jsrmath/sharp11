var charts = require('./charts');
var improv = require('../lib/improv');
var _ = require('underscore');

var imp = improv.create().over('chart', charts.myFunnyValentine);
var imp2 = improv.create().over('chart', charts.takeTheATrain);
var imp3 = improv.create({restRange: [0.75, 0.25], rhythmRange: [0.25, 0.75]}).over('chart', charts.goodbyePorkPieHat);
var imp4 = improv.create({restRange: [0.5, 0], rhythmRange: [0, 0.75], useSixteenths: false, onlyEighthRests: true}).over('chart', charts.giantSteps);
var imp5 = improv.create({dissonance: 0, restRange: [0.75, 0], rhythmRange: [0, 0.75]}).over('chart', charts.myFunnyValentineFull);

_.each([imp, imp2, imp3, imp4, imp5], function (imp) {
  console.log(imp.toString() + '\n');
});

imp.midi('test.mid');
imp2.midi('test2.mid', {tempo: 160});
imp3.midi('test3.mid', {tempo: 60});
imp4.midi('test4.mid', {tempo: 200});
imp5.midi('test5.mid');