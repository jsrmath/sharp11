var chart = require('../lib/chart');

var assert = require('assert');

describe('Chart', function () {
  describe('#create', function () {
    it('should create a chord chart', function () {
      var c = chart.create(['A', 'B', 'A'], { A: [{ chord: 'C7', duration: 4 }], B: [{ chord: 'Dm', duration: 4 }] }, { foo: 1 });
      assert.equal(c.sections.toString(), 'A,B,A');
      assert.equal(c.content.A[0].chord.name, 'C7');
      assert.equal(c.content.A[0].duration.value(), 4);
      assert.equal(c.info.foo, 1);

      c = chart.create(['A', 'B', 'A'], { A: [['C7', 4]], B: [['Dm', 4]] }, { foo: 1 });
      assert.equal(c.sections.toString(), 'A,B,A');
      assert.equal(c.content.A[0].chord.name, 'C7');
      assert.equal(c.content.A[0].duration.value(), 4);
      assert.equal(c.info.foo, 1);

      c = chart.create();
      assert.equal(c.sections.length, 0);
      assert(c.content instanceof Object);
      assert(c.info instanceof Object);
    });

    it('should throw an error if not all sections are defined', function () {
      assert.throws(function () {
        chart.create(['A'], {});
      });
    });
  });

  describe('#createSingleton', function () {
    it('should create a chord chart with one section', function () {
      var c = chart.createSingleton([['C7', 4]], { foo: 1 });
      assert.equal(c.sections.toString(), 'A');
      assert.equal(c.content.A[0].chord.name, 'C7');
      assert.equal(c.content.A[0].duration.value(), 4);
      assert.equal(c.info.foo, 1);
    });
  });

  describe('#isChart', function () {
    it('should return true iff a given object is a chord chart', function () {
      assert(chart.isChart(chart.createSingleton([['C7', 4]], { foo: 1 })));
      assert(!chart.isChart({}));
    });
  });

  describe('#key', function () {
    it('should return the key for a chart as a note object', function () {
      assert.equal(chart.createSingleton([], { key: 'F' }).key().name, 'F');
      assert.equal(chart.createSingleton([]).key().name, 'C');
    });
  });

  describe('#title', function () {
    it('should return the title of the song or "Untitled"', function () {
      assert.equal(chart.createSingleton([], { title: 'Foo' }).title(), 'Foo');
      assert.equal(chart.createSingleton([]).title(), 'Untitled');
    });
  });

  describe('#chart', function () {
    it('should return the full chord chart', function () {
      var c = chart.create(['A', 'B', 'A'], { A: [['C7', 4]], B: [['Dm', 4]] }, { foo: 1 });
      assert.equal(c.chart().length, 3);
      assert.equal(c.chart()[0].chord.name, 'C7');
      assert.equal(c.chart()[1].chord.name, 'Dm');
      assert.equal(c.chart(['B'])[0].chord.name, 'Dm');

      c = chart.create(['A', 'B', 'A'], { A: [['C7', 4]], B: [] }, { foo: 1 });
      assert.equal(c.chart().length, 2);

      c = chart.createSingleton([]);
      assert.equal(c.chart().length, 0);
    });
  });

  describe('#chartWithWrapAround', function () {
    it('should return the full chord chart with wrap around', function () {
      var c = chart.create(['A', 'B'], { A: [['C7', 4]], B: [['Dm', 4]] }, { foo: 1 });
      assert.equal(c.chartWithWrapAround().length, 3);
      assert.equal(c.chartWithWrapAround()[2].chord.name, 'C7');
      assert.equal(c.chartWithWrapAround(['B', 'A'])[2].chord.name, 'Dm');

      c = chart.createSingleton([]);
      assert.equal(c.chartWithWrapAround().length, 0);
    });
  });

  describe('#chordList', function () {
    it('should return the full chord list', function () {
      var c = chart.create(['A', 'B', 'A'], { A: [['C7', 4]], B: [['Dm', 4]] }, { foo: 1 });
      assert.equal(c.chordList().length, 3);
      assert.equal(c.chordList()[0].name, 'C7');
      assert.equal(c.chordList()[1].name, 'Dm');
      assert.equal(c.chordList(['B'])[0].name, 'Dm');

      c = chart.createSingleton([]);
      assert.equal(c.chordList().length, 0);
    });
  });

  describe('#chordListWithWrapAround', function () {
    it('should return the full chord list with wrap around', function () {
      var c = chart.create(['A', 'B'], { A: [['C7', 4]], B: [['Dm', 4]] }, { foo: 1 });
      assert.equal(c.chordListWithWrapAround().length, 3);
      assert.equal(c.chordListWithWrapAround()[2].name, 'C7');
      assert.equal(c.chordListWithWrapAround(['B', 'A'])[2].name, 'Dm');

      c = chart.createSingleton([]);
      assert.equal(c.chordListWithWrapAround().length, 0);
    });
  });

  describe('#sectionChordLists', function () {
    it('should return chord lists for each section', function () {
      var c = chart.create(['A', 'B', 'A'], { A: [['C7', 4]], B: [['Dm', 4]] }, { foo: 1 });
      assert.equal(c.sectionChordLists().A[0].name, 'C7');
      assert.equal(c.sectionChordLists().B[0].name, 'Dm');

      c = chart.createSingleton([]);
      assert.equal(c.sectionChordLists().A.length, 0);
    });
  });

  describe('#sectionChordListsWithWrapAround', function () {
    it('should return chord lists for each section with wrap around', function () {
      var c = chart.create(['A', 'B', 'A'], { A: [['C7', 4]], B: [['Dm', 4]] }, { foo: 1 });
      assert.equal(c.sectionChordListsWithWrapAround().A[1].name, 'Dm');
      assert.equal(c.sectionChordListsWithWrapAround().B[1].name, 'C7');

      c = chart.createSingleton([['C7', 4], ['D7', 4]]);
      assert.equal(c.sectionChordListsWithWrapAround().A[2].name, 'C7');

      c = chart.createSingleton([]);
      assert.equal(c.sectionChordListsWithWrapAround().A.length, 0);
    });
  });
});
