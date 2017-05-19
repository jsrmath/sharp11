// jazz.js

var _ = require('underscore');
var S = require('string');
var fs = require('fs');

var note = require('./note');
var chord = require('./chord');
var duration = require('./duration');
var chart = require('./chart');

var durations = [];

var handleChordAliases = function (str) {
  return str.replace(/-/g, 'b')
            .replace(/h/g, 'ø')
            .replace(/:/g, '')
            .replace(/\(.*\)/g, '');
};

var parseChord = function (str) {
  return chord.create(handleChordAliases(str));
};

// Warning: This function cannot handle arbitrary durations in arbitrary time signatures
// It has been designed specifically to accomodate the durations used in the iRb corpus
var parseDuration = function (str, jazz) {
  // The corpus uses a whole note to represent 5 beats in 5/4 time
  if (jazz.info.time.toString() === '5,4' && str === '1') {
    return duration.beats(5);
  }

  // If we're in 6/8 and we see a 2., treat it as 2 beats
  if (jazz.info.time.toString() === '6,8' && str === '2.') {
    return duration.beats(2);
  }

  // Otherwise, use this map
  return {
    '8': duration.subunit('eighth'), // TODO: Handle long vs short eighths
    '4': duration.beats(1),
    '4.': duration.beats(1).addSubunit('eighth'),
    '2': duration.beats(2),
    '2.': duration.beats(3),
    '1': duration.beats(4),
    '1.': duration.beats(6)
  }[str];
};

var mergeDuplicateChords = function (chords) {
  return _.reduce(chords, function (arr, chord) {
    var lastChord;

    if (!chord) return arr;

    // If the chord we're about to add is identical to the previous one, merge the durations
    lastChord = _.last(arr);
    if (lastChord && lastChord.chord.name === chord.chord.name) {
      return _.initial(arr).concat([{
        chord: lastChord.chord,
        duration: lastChord.duration.merge(chord.duration)
      }]);
    }
    else {
      return arr.concat([chord]);
    }
  }, []);
};

var parseHeader = function (jazz, lines) {
  var headerEndIndex = _.indexOf(lines, '**jazz');
  var headerLines = lines.slice(0, headerEndIndex);
  var restLines = lines.slice(headerEndIndex + 1);

  // Maps keywords in jazz format to corresponding keywords in chart.info
  var keywordMap = {
    OTL: 'title',
    COM: 'composer',
    COM1: 'composer',
    LYR: 'lyricist',
    LYR1: 'lyricist',
    ODT: 'date'
  };

  _.each(headerLines, function (line) {
    _.each(keywordMap, function (infoKeyword, jazzKeyword) {
      var str = '!!!' + jazzKeyword + ': ';
      if (line.match(new RegExp('^' + str))) {
        jazz.info[infoKeyword] = S(line).chompLeft(str).s;
      }
    });
  });

  return restLines;
};

// Parse information from section header and return section name
var parseSectionHeader = function (jazz, lines) {
  var section = {
    content: []
  };
  var name = lines[0].match(/^\*>(.*)$/)[1];
  var line;
  var matches;

  // If this section specifies a key and a key has not already been specified, set key
  if (!jazz.info.key && (line = _.find(lines, function (l) {
    return l.match(/^\*.+:$/);
  }))) {
    matches = line.match(/^\*(.+):$/);
    jazz.info.key = note.create(handleChordAliases(matches[1]));
    jazz.info.minor = S(matches[1]).isLower();
  }

  // If this section specifies a time and a time has not already been specified, set time
  if (!jazz.info.time && (line = _.find(lines, function (l) {
    return l.match(/^\*M.+$/);
  }))) {
    matches = line.match(/^\*M(\d+\.*)\/(\d+\.*)$/);
    jazz.info.time = [parseInt(matches[1], 10), parseInt(matches[2], 10)];
  }

  return name;
};

var parseSectionBody = function (jazz, lines) {
  return mergeDuplicateChords(_.map(lines, function (l) {
    var chordChange = {};
    var matches;

    if (l[0] === '!' || _.last(l) === 'r') return null;

    matches = l.match(/^(\d+\.*)(.+)$/);
    return { chord: parseChord(matches[2]), duration: parseDuration(matches[1], jazz) };
  }));
};

var parseSection = function (jazz, sectionHeader, sectionBody) {
  var sectionName = parseSectionHeader(jazz, sectionHeader);
  jazz.content[sectionName] = parseSectionBody(jazz, sectionBody);
};

var parseNextSection = function (jazz, lines) {
  var sectionBodyStartIndex;
  var sectionHeaderEndIndex;
  var sectionEndIndex;
  var sectionHeader;
  var sectionBody;

  // Find the last section header line, which will begin with *
  for (sectionBodyStartIndex = 0; lines[sectionBodyStartIndex][0] === '*'; sectionBodyStartIndex++);

  sectionHeader = lines.slice(0, sectionBodyStartIndex);
  sectionHeaderEndIndex = sectionBodyStartIndex - 1;

  // Handle empty section case
  if (sectionHeaderEndIndex > 0 && lines[sectionHeaderEndIndex].match(/^\*>/)) {
    parseSection(jazz, lines.slice(0, sectionHeaderEndIndex), []);
    return lines.slice(sectionHeaderEndIndex);
  }

  // Find the end of the section
  for (sectionEndIndex = sectionBodyStartIndex; sectionEndIndex < lines.length; sectionEndIndex++) {
    if (lines[sectionEndIndex][0] === '*') {
      if (lines[sectionEndIndex][1] === 'M') {
        // TODO: Properly handle meter changes within sections
        lines.splice(sectionEndIndex, 1);
      }
      else {
        break;
      }
    }
  }

  sectionBody = lines.slice(sectionBodyStartIndex, sectionEndIndex);

  parseSection(jazz, sectionHeader, sectionBody);

  return lines.slice(sectionEndIndex);
};

var parseBody = function (jazz, lines) {
  var matches;

  if ((matches = lines[0].match(/^\*>\[(.+)\]$/))) {
    jazz.sections = matches[1].split(',');
    lines = _.rest(lines);
  }
  else {
    // If the song doesn't have section, give it a single section called "A"
    jazz.sections = ['A'];
    lines = ['*>A'].concat(lines);
  }

  // Special case where key and/or time are before section declaration instead of after
  if (lines[1].match(/^\*>/)) {
    lines = [lines[1], lines[0]].concat(lines.slice(2));
  }
  if (lines[2].match(/^\*>/)) {
    lines = [lines[2], lines[0], lines[1]].concat(lines.slice(3));
  }

  // Special case where there is no first section, add one called intro
  if (!lines[0].match(/^\*>/)) {
    jazz.sections.unshift('Intro');
    lines = ['*>Intro'].concat(lines);
  }

  while (lines[0].match(/^\*>/)) {
    lines = parseNextSection(jazz, lines);
  }

  return lines;
};

var parseFooter = function (jazz, lines) {
  // TODO: parse footer

  return [];
};

var parseJazzString = function (str) {
  var lines = _.chain(str.split('\n'))
    .map(function (l) {
      return S(l).trim().s;
    })
    .reject(function (l) {
      return l[0] === '=';
    })
    .compact()
    .value();

  var jazz = {
    sections: [],
    content: {},
    info: {}
  };

  lines = parseHeader(jazz, lines);
  lines = parseBody(jazz, lines);
  parseFooter(jazz, lines);

  return chart.create(jazz.sections, jazz.content, jazz.info);
};

module.exports.parseString = parseJazzString;
module.exports.parseFile = function (path) {
  return parseJazzString(fs.readFileSync(path, 'utf8'));
};
