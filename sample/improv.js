var charts = require('./charts');
var improv = require('../lib/improv');
var _ = require('underscore');

var imp = improv.create().over('chart', charts.myFunnyValentine);
var imp2 = improv.create().over('chart', charts.takeTheATrain);
var imp3 = improv.create().over('chart', charts.goodbyePorkPieHat);

_.each([imp, imp2], function (imp) {
  console.log(imp.map(function (obj) {
    return obj.scale.fullName + ': ' + obj.notes.map(function (arr) {
      return '[' + arr.map(function (x) { return x || 'r' }).toString() + ']';
    });
  }));
});

imp.midi('test.mid');
imp2.midi('test2.mid', {tempo: 160});
imp3.midi('test3.mid', {tempo: 60});