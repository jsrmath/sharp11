var charts = require('./charts');
var improv = require('../lib/improv');
var _ = require('underscore');

var imp = improv.create().over('chart', charts.myFunnyValentine);
var imp2 = improv.create().over('chart', charts.takeTheATrain);
var imp3 = improv.create().over('chart', charts.goodbyePorkPieHat);
var imp4 = improv.create({rests: 0.25, rhythmicVariety: 0.25}).over('chart', charts.giantSteps);

_.each([imp, imp2], function (imp) {
  console.log(imp.map(function (obj) {
    return obj.scale.fullName + ': ' + obj.notes.map(function (arr) {
      return '[' + arr.map(function (x) { return x || 'r'; }).toString() + ']';
    });
  }));
});

imp.midi('test.mid');
imp2.midi('test2.mid', {tempo: 160});
imp3.midi('test3.mid', {tempo: 60});
imp4.midi('test4.mid', {tempo: 200});