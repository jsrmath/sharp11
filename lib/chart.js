// chart.js

var note = require('./note');
var chord = require('./chord');
var duration = require('./duration');
var midi = require('./midi');
var mehegan = require('./mehegan');
var _ = require('underscore');
var jsonfile = require('jsonfile');

var formatChartContent = function (content) {
  if (!content) return {};

  return _.mapObject(content, function (section) {
    return _.map(section, function (obj) {
      var entry = obj;

      // If we're given an array like [Cm7, 4], convert it to { chord: Cm7, duration: 4 }
      if (obj.length > 1) {
        entry = { chord: obj[0], duration: obj[1] };
      }

      // Ensure chord and duration are of proper types
      entry.chord = chord.create(entry.chord);
      entry.duration = duration.asDuration(entry.duration);

      return entry;
    });
  });
};

var Chart = function (sections, content, info) {
  this.sections = sections || [];
  this.content = formatChartContent(content);

  // Info should only contain JS primitives, not sharp11 objects
  this.info = info || {};

  // Ensure each section has been defined
  _.each(this.sections, function (section) {
    if (!content[section]) {
      throw new Error('Must define content for section ' + section);
    }
  });
};

// Concatenates all the sections in order specified by this.sections or given argument
Chart.prototype.chart = function (sections) {
  var content = this.content;
  sections = sections || this.sections;

  return _.reduce(sections, function (arr, section) {
    return arr.concat(content[section]);
  }, []);
};

// The full chart with the first chord appended to the end
Chart.prototype.chartWithWrapAround = function (sections) {
  return this.chart(sections).length ? this.chart(sections).concat(this.chart(sections)[0]) : [];
};

// The full chart with only chords, no durations
Chart.prototype.chordList = function (sections) {
  return _.pluck(this.chart(sections), 'chord');
};

// The chord list with the first chord appended to the end
Chart.prototype.chordListWithWrapAround = function (sections) {
  return _.pluck(this.chartWithWrapAround(sections), 'chord');
};

// The full chart with only Mehegan symbols, no durations
Chart.prototype.meheganList = function (sections) {
  var chords = _.pluck(this.chart(sections), 'chord');
  return mehegan.fromChords(this.key(), chords);
};

// The list of Mehegan symbols with the first symbol appended to the end
Chart.prototype.meheganListWithWrapAround = function (sections) {
  var chords = _.pluck(this.chartWithWrapAround(sections), 'chord');
  return mehegan.fromChords(this.key(), chords);
};

// A map of each section to a list of chords
Chart.prototype.sectionChordLists = function () {
  return _.mapObject(this.content, function (obj) {
    return _.pluck(obj, 'chord');
  });
};

// A map of each section to a list of Mehegan symbols
Chart.prototype.sectionMeheganLists = function () {
  var key = this.key();
  return _.mapObject(this.sectionChordLists(), function (chords) {
    return mehegan.fromChords(key, chords);
  });
};

// Section chord lists with the first chord of the next section appended at the end of each one
Chart.prototype.sectionChordListsWithWrapAround = function () {
  var sections = this.sections;

  return _.mapObject(this.sectionChordLists(), function (chordList, sectionName, allSections) {
    var nextSection = sections[(_.indexOf(sections, sectionName) + 1) % sections.length];
    
    if (allSections[nextSection].length) {
      chordList.push(allSections[nextSection][0]);
    }

    return chordList;
  });
};

// Section Mehegan lists with the first symbol of the next section appended at the end of each one
Chart.prototype.sectionMeheganListsWithWrapAround = function () {
  var key = this.key();
  return _.mapObject(this.sectionChordListsWithWrapAround(), function (chords) {
    return mehegan.fromChords(key, chords);
  });
};

// Return the key of the song, or C if not specified
Chart.prototype.key = function () {
  if (!this.info.key) return note.create('C');
  return note.create(this.info.key);
};

// Return the title of the song, or "Untitled" if not specified
Chart.prototype.title = function () {
  return this.info.title || 'Untitled';
};

// Given midi settings, return a Midi object for this chart
Chart.prototype.midi = function (settings) {
  return midi.create(settings).addChordTrack(this.chart());
};

Chart.prototype.serialize = function () {
  var content = _.mapObject(this.content, function (section) {
    return _.map(section, function (obj) {
      return {
        chord: obj.chord.name,
        duration: {
          beats: obj.duration.beats,
          subunits: obj.duration.subunits
        }
      };
    });
  });

  return { sections: this.sections, content: content, info: this.info };
};

module.exports.Chart = Chart;

module.exports.create = function (sections, content, info) {
  return new Chart(sections, content, info);
};

var load = module.exports.load = function (obj) {
  var content = _.mapObject(obj.content, function (section) {
    return _.map(section, function (obj) {
      return {
        chord: chord.create(obj.chord),
        duration: new duration.Duration(obj.duration.beats, obj.duration.subunits)
      };
    });
  });

  return new Chart(obj.sections, content, obj.info);
};

module.exports.export = function (obj, filename) {
  jsonfile.writeFileSync(filename, obj.serialize());
};

module.exports.import = function (filename) {
  return load(jsonfile.readFileSync(filename));
};

module.exports.createSingleton = function (content, info) {
  return new Chart(['A'], { A: content }, info);
};

module.exports.isChart = function (obj) {
  return obj instanceof Chart;
};
