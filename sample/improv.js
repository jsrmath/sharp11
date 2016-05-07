var charts = require('./charts');
var improv = require('../lib/improv');
var _ = require('underscore');

var imp = improv.create().over('chart', charts.myFunnyValentine);
var imp2 = improv.create().over('chart', charts.takeTheATrain);
var imp3 = improv.create().over('chart', charts.goodbyePorkPieHat);
var imp4 = improv.create({useSixteenths: false, onlyEighthRests: true}).over('chart', charts.giantSteps);
var imp5 = improv.create({dissonance: 0}).over('chart', charts.myFunnyValentineFull);

_.each([imp, imp2, imp3, imp4, imp5], function (imp) {
  console.log(imp.toString() + '\n');
});

imp.midi().writeSync('test.mid');
imp2.midi({tempo: 160}).writeSync('test2.mid');
imp3.midi({tempo: 60}).writeSync('test3.mid');
imp4.midi({tempo: 200}).writeSync('test4.mid');
imp5.midi().writeSync('test5.mid');
