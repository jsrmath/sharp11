var jazz = require('../lib/jazz');
var jza = require('../lib/jza');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var samples = _.reject(fs.readdirSync(path.join(__dirname, '..', 'corpus')), function (filename) {
  return filename[0] === '.';
});

var parseSamples = function () {
  return _.map(samples, function (filename) {
    return jazz.parseFile(path.join(__dirname, '..', 'corpus', filename));
  });
};

var getSymbolsFromChordList = function (chordList, key) {
  return _.map(chordList, function (chord) {
    return jza.symbolFromChord(key, chord);
  });
};

var validateSong = function (filename) {
  var j = jazz.parseFile(path.join(__dirname, '..', 'corpus', filename));
  var symbols;

  symbols = getSymbolsFromChordList(j.fullChordList(), j.getMainKey());
  console.log(symbols.toString());

  return jza.jza().validate(symbols);
};

var analyzeFailurePoints = function (failurePoints, failurePointSymbols, secondaryGroupingIndex) {
  failurePoints = _.chain(failurePoints)
    .groupBy(function (p) {
      return _.map(failurePointSymbols, function (offset) {
        return p.symbols[p.index + offset];
      }).join(' ');
    })
    .pairs()
    .map(function (pair) {
      var secondaryGroupings = null;

      if (typeof(secondaryGroupingIndex) === 'number') {
        secondaryGroupings = _.chain(pair[1])
          .groupBy(function (point) {
            return point.symbols[point.index + secondaryGroupingIndex] + '';
          })
          .mapObject(function (val) {
            return val.length;
          })
          .value();
      }

      return [pair[0], pair[1].length, _.pluck(pair[1], 'name'), secondaryGroupings];
    })
    .sortBy(function (p) {
      return -p[1];
    })
    .value()
    .slice(0, 10);
  console.log(failurePoints);
};

var runTests = function (failurePointSymbols, secondaryGroupingIndex, minSectionSize) {
  var totalPassedSongs = 0;
  var totalPassedSections = 0;
  var totalSongs = 0;
  var totalSections = 0;
  var failurePoints = [];

  var songs = _.map(parseSamples(), function (j, i) {
    // Symbols for the entire song
    var song = getSymbolsFromChordList(j.fullChordListWithWrapAround(), j.getMainKey());

    // Object mapping section name to list of symbols for particular section
    var sections = _.chain(j.sectionChordListsWithWrapAround())
      .omit(function (chordList) {
        return chordList.length < (minSectionSize || 2);
      })
      .mapObject(function (chordList) {
        return getSymbolsFromChordList(chordList, j.getMainKey());
      })
      .value();

    totalSongs += 1;
    totalSections += _.keys(sections).length;

    return {
      name: samples[i].replace('.jazz', ''),
      song: song,
      sections: sections
    };
  });

  _.each(songs, function (song) {
    var passedSong = jza.jza().validate(song.song);
    
    // For each section that fails, compute its failure points
    var sectionFailurePoints = _.compact(_.map(song.sections, function (symbols, sectionName) {
      var failurePoint = jza.jza().findFailurePoint(symbols);

      if (failurePoint) {
        failurePoint.name = song.name + ' ' + sectionName;
      }

      return failurePoint;
    }));

    var numSections = _.keys(song.sections).length;
    var passedSections = numSections - sectionFailurePoints.length;

    if (passedSong) totalPassedSongs += 1;
    totalPassedSections += passedSections;

    failurePoints = failurePoints.concat(sectionFailurePoints);

    console.log(song.name + (passedSong ? ' √ ' : ' X ') + passedSections + ' / ' + numSections);
  });

  console.log('Sections: ' + totalPassedSections / totalSections);
  console.log('Songs: ' + totalPassedSongs / totalSongs);

  if (failurePointSymbols) analyzeFailurePoints(failurePoints, failurePointSymbols, secondaryGroupingIndex);
};

runTests([-1, 0, 1], -2);
