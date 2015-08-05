var charts = require('./charts');
var improv = require('../lib/improv');

console.log(improv.create().over('chart', charts.myFunnyValentine).map(function (obj) {
	return obj.scale.fullName + ': ' + obj.notes.map(function (arr) {
		return '[' + arr.toString() + ']';
	});
}));