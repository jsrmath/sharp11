var jazz = require('../lib/jazzparser');
var jza = require('../lib/jza');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var jzaAutomaton;

var samples = _.reject(fs.readdirSync(path.join(__dirname, '..', 'corpus')), function (filename) {
  return filename[0] === '.';
});

var parseSamples = function () {
  return _.map(samples, function (filename) {
    return jazz.parseFile(path.join(__dirname, '..', 'corpus', filename));
  });
};

var getSymbolsFromChordList = function (chordList, key) {
  var symbols = _.map(chordList, function (chord) {
    return jza.symbolFromChord(key, chord);
  });

  // Turn a, a, b, b into a, b
  var compressedSymbols = [_.first(symbols)];
  _.each(_.rest(symbols), function (symbol) {
    if (!symbol.eq(_.last(compressedSymbols))) {
      compressedSymbols.push(symbol);
    }
  });

  return compressedSymbols;
};

var validateSong = function (filename) {
  var j = jazz.parseFile(path.join(__dirname, '..', 'corpus', filename));
  var symbols;

  symbols = getSymbolsFromChordList(j.fullChordList(), j.getMainKey());
  console.log(symbols.toString());

  return jzaAutomaton.validate(symbols);
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
    var passedSong = jzaAutomaton.validate(song.song);
    
    // For each section that fails, compute its failure points
    var sectionFailurePoints = _.compact(_.map(song.sections, function (symbols, sectionName) {
      var failurePoint = jzaAutomaton.findFailurePoint(symbols);

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

var trainJzA = function (minSectionSize) {
  var sections = _.reduce(parseSamples(), function (sections, j) {
    return sections.concat(_.chain(j.sectionChordListsWithWrapAround())
      .omit(function (chordList) {
        return chordList.length < (minSectionSize || 2);
      })
      .map(function (chordList) {
        return getSymbolsFromChordList(chordList, j.getMainKey());
      })
      .value());
  }, []);

  console.log('Training model');
  jzaAutomaton.train(sections);
  console.log('Training complete');
};

var generateSequence = function (start, end) {
  var sequence = jzaAutomaton.generateSequenceFromStartAndEnd(start, end);
  console.log(sequence.getSymbolStateStrings().join(' | '));
  console.log(_.pluck(sequence.getChordsCollapsed(), 'name').toString());
  console.log();
};

var mostCommonGeneratedSequences = function (start, end, count) {
  var counts = _.chain(count)
    .range()
    .map(function () {
      var sequence = jzaAutomaton.generateSequenceFromStartAndEnd(start, end);
      return _.pluck(sequence.getChordsCollapsed(), 'name').toString();
    })
    .countBy()
    .pick(function (count) {
      return count > 1;
    })
    .pairs()
    .sortBy(function (x) {
      return -x[1];
    })
    .map(function (x) {
      return x[0] + ': ' + x[1];
    })
    .value()
    .join('\n');
  console.log(counts);
};

var findSongsWithSequence = function (sequence) {
  return _.compact(_.map(parseSamples(), function (j, i) {
    var song = getSymbolsFromChordList(j.fullChordListWithWrapAround(), j.getMainKey());
    var songName = samples[i];
    var matchesSequence = _.some(_.range(song.length - sequence.length + 1), function (songIndex) {
      return _.all(sequence, function (symbol, sequenceIndex) {
        return song[songIndex + sequenceIndex].eq(symbol);
      });
    });

    return matchesSequence ? songName : null;
  }));
};

var countInstancesOfSequence = function (sequence) {
  var instances = 0;

  _.each(parseSamples(), function (j, i) {
    var song = getSymbolsFromChordList(j.fullChordListWithWrapAround(), j.getMainKey());
    _.each(_.range(song.length - sequence.length + 1), function (songIndex) {
      var matchesSequence = _.all(sequence, function (symbol, sequenceIndex) {
        return song[songIndex + sequenceIndex].eq(symbol);
      });

      if (matchesSequence) instances += 1;
    });
  });

  return instances;
};

var getNGramProbability = function (sequence) {
  return countInstancesOfSequence(sequence) / countInstancesOfSequence(sequence.slice(0, 1));
};

parseSamples();
console.log(jazz.getDurations());

//// Below are examples of how to interact with the automaton and the corpus
//// Uncomment lines beginning with // to try them out

//// Create a new automaton
// jzaAutomaton = jza.jza();

//// and train it
// trainJzA();

//// or load a saved model
// jzaAutomaton = jza.import('sample/model.json');

//// Run validation tests (how many songs / sections can be understood by the model)
// runTests();

//// Get probabilities of a particular symbol being used to transition to different states
//// (in other words, get probabilities of a particular symbol having different chord functions)
// console.log(jzaAutomaton.getStateProbabilitiesGivenSymbol('VIx'));

//// Get transition probabilities from particular states given a state name regex
// console.log(jzaAutomaton.getTransitionProbabilitiesGivenStateRegex(/^Subdominant b6/));

//// Generate sequences that start and end with particular symbols
// _.times(20, function () {
//   generateSequence('I', 'I');
// });

//// Find songs in the corpus that contain a given sequence
// console.log(findSongsWithSequence(['bIIIM', 'bVIx', 'V']));

//// Get probability of a particular ngram appearing in the corpus
//// This example returns P(bVIX,V | bIIIM)
// console.log(getNGramProbability(['bIIIM', 'bVIx', 'V']));

//// Find the most commonly generated sequences (out of n=500) given a start and end symbol
// mostCommonGeneratedSequences('I', 'I', 500);
