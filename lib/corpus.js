// corpus.js

var chart = require('./chart');
var _ = require('underscore');
var jsonfile = require('jsonfile');

var Corpus = function (charts) {
  this.charts = charts;

  if (!_.every(charts, chart.isChart)) {
    throw new Error('A corpus must be created from an array of charts.');
  }
};

// Given a Mehegan sequence, return songs that contain that sequence
Corpus.prototype.findSongsWithSequence = function (sequence) {
  return _.compact(_.map(this.charts, function (chart) {
    var symbols = chart.meheganListWithWrapAround();
    var matchesSequence = _.some(_.range(symbols.length - sequence.length + 1), function (songIndex) {
      return _.all(sequence, function (symbol, sequenceIndex) {
        return symbols[songIndex + sequenceIndex].eq(symbol);
      });
    });

    return matchesSequence ? chart : null;
  }));
};

// Given a Mehegan sequence, return titles songs that contain that sequence
Corpus.prototype.findSongTitlesWithSequence = function (sequence) {
  return _.invoke(this.findSongsWithSequence(sequence), 'title');
};

// Given a Mehegan sequence, return number of instances of that sequence in the corpus
Corpus.prototype.countInstancesOfSequence = function (sequence) {
  var instances = 0;

  _.each(this.charts, function (chart) {
    var symbols = chart.meheganListWithWrapAround();
    _.each(_.range(symbols.length - sequence.length + 1), function (songIndex) {
      var matchesSequence = _.all(sequence, function (symbol, sequenceIndex) {
        return symbols[songIndex + sequenceIndex].eq(symbol);
      });

      if (matchesSequence) instances += 1;
    });
  });

  return instances;
};

// Get probability of a particular n-gram (Mehegan sequence) appearing in the corpus
// getNGramProbability([a,b,c]) returns P(b,c|a)
Corpus.prototype.getNGramProbability = function (sequence) {
  return this.countInstancesOfSequence(sequence) / this.countInstancesOfSequence(sequence.slice(0, 1));
};

Corpus.prototype.serialize = function () {
  return {
    charts: _.invoke(this.charts, 'serialize'),
  };
};

module.exports.create = function (charts) {
  return new Corpus(charts);
};

var load = module.exports.load = function (obj) {
  return new Corpus(_.map(obj.charts, chart.load));
};

module.exports.export = function (obj, filename) {
  jsonfile.writeFileSync(filename, obj.serialize());
};

module.exports.import = function (filename) {
  return load(jsonfile.readFileSync(filename));
};

module.exports.Corpus = Corpus;
