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

  try {
    symbols = getSymbolsFromChordList(j.fullChordList(), j.getMainKey());
    console.log(symbols.toString());
    return jza.jza().validate(symbols);
  } catch (err) {
    return false;
  }
};

var runSectionTests = function () {
  var totalSections = 0;
  var passedSections = 0;
  var sectionSizes = {};

  var songs = _.compact(_.map(parseSamples(), function (j) {
    try {
      return _.compact(_.map(j.sectionChordLists(), function (chordList) {
        if (chordList.length < 2) return null;

        return getSymbolsFromChordList(chordList, j.getMainKey());
      }));
    } catch (err) {
      return null;
    }
  }));

  _.each(songs, function (song, i) {
    var sections = 0;

    console.log((i + 1) + ' / ' + songs.length);

    totalSections += song.length;

    _.each(song, function (section) {
      if (jza.jza().validate(section)) sections++;
      
      // Update sectionSizes
      sectionSizes[section.length] = sectionSizes[section.length] || 0;
      sectionSizes[section.length]++;
    });

    passedSections += sections;
  });

  console.log('Sections: ' + passedSections / totalSections);
  console.log('Section size distribution:\n' + JSON.stringify(sectionSizes));
};

var runFullTests = function (failurePointSymbols, secondaryGroupingIndex) {
  var failurePoints = [];
  var songs = _.compact(_.map(parseSamples(), function (j, i) {
    try {
      return {
        name: samples[i],
        symbols: getSymbolsFromChordList(j.fullChordList(), j.getMainKey())
      };
    } catch (err) {
      return null;
    }
  }));

  var passedSongs = _.filter(songs, function (song, i) {
    console.log(song.name);

    var failurePoint = jza.jza().findFailurePoint(song.symbols);

    if (failurePoint) {
      failurePoint.name = song.name;
      failurePoints.push(failurePoint);
      return false;
    }

    return true;
  });

  console.log(passedSongs.length / songs.length);

  if (failurePointSymbols) {
    failurePoints = _.chain(failurePoints)
      .groupBy(function (p) {
        return _.map(failurePointSymbols, function (offset) {
          return p.symbols[p.index + offset];
        }).join(' ');
      })
      .pairs()
      .map(function (pair) {
        if (typeof(secondaryGroupingIndex) === 'number') {
          return [pair[0], pair[1].length, _.chain(pair[1])
            .groupBy(function (point) {
              return point.symbols[point.index + secondaryGroupingIndex] + '';
            })
            .mapObject(function (val) {
              return val.length;
            })
            .value()];
        }

        return [pair[0], pair[1].length, _.pluck(pair[1], 'name')];
      })
      .sortBy(function (p) {
        return -p[1];
      })
      .value()
      .slice(0, 10);
    console.log(failurePoints);
  }
};

// runSectionTests();
runFullTests([-1, 0], -2);
