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
            .replace(/:/g, '');
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

    if (l[0] === '=' || l[0] === '!' || _.last(l) === 'r') return;

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
  var sectionHeaderEndIndex;
  var sectionEndIndex;
  var sectionHeader;
  var sectionBody;

  // Find the last section header line, which will begin with *
  for (sectionHeaderEndIndex = 0; lines[sectionHeaderEndIndex][0] === '*'; sectionHeaderEndIndex++);

  sectionHeader = lines.slice(0, sectionHeaderEndIndex);

  // Handle empty section case
  if (lines[1].match(/^\*>/)) {
    parseSection(jazz, lines.slice(0, 1), []);
    return lines.slice(1);
  }

  // Find the end of the section
  for (sectionEndIndex = sectionHeaderEndIndex; lines[sectionEndIndex][0] !== '*' && sectionEndIndex < lines.length; sectionEndIndex++);

  sectionBody = lines.slice(sectionHeaderEndIndex, sectionEndIndex);

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
    .compact()
    .value();
  var jazz = new Jazz();

  lines = parseHeader(jazz, lines);
  lines = parseBody(jazz, lines);
  parseFooter(jazz, lines);

  return jazz;
};

module.exports.parseString = parseJazzString;
module.exports.parseFile = function (path) {
  return parseJazzString(fs.readFileSync(path, 'utf8'));
};

