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

    console.log(i + ' / ' + songs.length);

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

var runFullTests = function () {
  var songs = _.compact(_.map(parseSamples(), function (j) {
    try {
      return getSymbolsFromChordList(j.fullChordList(), j.getMainKey());
    } catch (err) {
      return null;
    }
  }));

  var passedSongs = _.filter(songs, function (song, i) {
    console.log(i + ' / ' + songs.length);

    return jza.jza().validate(song);
  });

  console.log(passedSongs.length / songs.length);
};

//runSectionTests();
runFullTests();
