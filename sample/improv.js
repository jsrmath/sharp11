var charts = require('./charts');
var improv = require('../lib/improv');
var _ = require('underscore');

var imp = improv.overChart(charts.myFunnyValentine, {sections: ['A']});
var imp2 = improv.overChart(charts.takeTheATrain, {repeat: 2});
var imp3 = improv.overChart(charts.goodbyePorkPieHat);
var imp4 = improv.overChart(charts.giantSteps, {useSixteenths: false, onlyEighthRests: true});
var imp5 = improv.overChart(charts.myFunnyValentine, {dissonance: 0, cadence: false});

_.each([imp, imp2, imp3, imp4, imp5], function (imp) {
  console.log(imp.toString() + '\n');
});

imp.midi().writeSync('test.mid');
imp2.midi({tempo: 160}).writeSync('test2.mid');
imp3.midi({tempo: 60}).writeSync('test3.mid');
imp4.midi({tempo: 200}).writeSync('test4.mid');
imp5.midi().writeSync('test5.mid');
