// jazz.js

// TODO: Write tests

var _ = require('underscore');
var S = require('string');
var fs = require('fs');

var note = require('./note');
var chord = require('./chord');

var Jazz = function () {
  this.sections = [];
  this.content = {};
};

Jazz.prototype.fullChordList = function () {
  var chords = [];
  var content = this.content;

  _.each(this.sections, function (sectionName) {
    chords = chords.concat(_.pluck(content[sectionName].content, 'chord'));
  });

  return chords;
};

Jazz.prototype.sectionChordLists = function () {
  var content = this.content;

  return _.map(this.sections, function (sectionName) {
    return _.pluck(content[sectionName].content, 'chord');
  });
};

Jazz.prototype.getMainKey = function () {
  return this.content[this.sections[0]].key;
};

var handleAliases = function (str) {
  return str.replace(/-/g, 'b')
            .replace(/h/g, 'ø')
            .replace(/:/g, '')
            .replace(/\(.*\)/g, '');
};

var parseHeader = function (jazz, lines) {
  var headerEndIndex = _.indexOf(lines, '**jazz');
  var headerLines = lines.slice(0, headerEndIndex);
  var restLines = lines.slice(headerEndIndex + 1);

  // TODO: parse header

  return restLines;
};

var createSectionFromHeader = function (jazz, lines) {
  var section = {
    content: []
  };
  var line;
  var matches;

  section.name = lines[0].match(/^\*>(.*)$/)[1];

  // Find key, either specified or inferred from last section
  if ((line = _.find(lines, function (l) {
    return l.match(/^\*.+:$/);
  }))) {
    matches = line.match(/^\*(.+):$/);
    section.key = note.create(handleAliases(matches[1]));
    section.minor = S(matches[1]).isLower();
  }
  else {
    section.key = _.last(jazz.sections).key;
    section.minor = _.last(jazz.sections).minor;
  }

  // Find time, either specified or inferred from last section
  if ((line = _.find(lines, function (l) {
    return l.match(/^\*M.+$/);
  }))) {
    matches = line.match(/^\*M(\d+\.*)\/(\d+\.*)$/);
    section.time = [matches[1], matches[2]];
  }
  else {
    section.time = _.last(jazz.sections).time;
  }

  return section;
};

var addSectionBody = function (lines, section) {
  _.each(lines, function (l) {
    var chordChange = {};
    var matches;

    if (l[0] === '!' || _.last(l) === 'r') return;

    // TODO: Convert duration type to actual duration
    matches = l.match(/^(\d+\.*)(.+)$/);
    chordChange.durationType = matches[1];
    chordChange.chord = chord.create(handleAliases(matches[2]));
    section.content.push(chordChange);
  });
};

var parseSection = function (jazz, sectionHeader, sectionBody) {
  var section = createSectionFromHeader(jazz, sectionHeader);
  addSectionBody(sectionBody, section);
  jazz.content[section.name] = section;
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
  var jazz = new Jazz();
  jazz.str = str;

  lines = parseHeader(jazz, lines);
  lines = parseBody(jazz, lines);
  parseFooter(jazz, lines);

  // Throw an error if a song has not defined all necessary sections
  _.each(jazz.sections, function (section) {
    if (!jazz.content[section]) throw new Error('Song must define section ' + section);
  });

  return jazz;
};

module.exports.parseString = parseJazzString;
module.exports.parseFile = function (path) {
  return parseJazzString(fs.readFileSync(path, 'utf8'));
};

