var corpus = require('../lib/corpus');
var chart = require('../lib/chart');

var assert = require('assert');

describe('Corpus', function () {
  describe('#findSongsWithSequence', function () {
    it('should return songs that contain a given Mehegan sequence', function () {
      var c1 = chart.create(['A', 'B', 'A'], { A: [['C', 4], ['G7', 4]], B: [['Dm', 4]] }, { title: '1' });
      var c2 = chart.create(['A', 'B', 'A'], { A: [['C', 4]], B: [['G7', 4], ['F', 4]] }, { title: '2' });
      var corp = corpus.create([c1, c2]);

      assert.equal(corp.findSongsWithSequence(['V', 'ii', 'I']).length, 1);
      assert.equal(corp.findSongsWithSequence(['V', 'ii', 'I'])[0].title(), '1');

      assert.equal(corp.findSongsWithSequence(['V', 'IV', 'I']).length, 1);
      assert.equal(corp.findSongsWithSequence(['V', 'IV', 'I'])[0].title(), '2');

      assert.equal(corp.findSongsWithSequence(['I', 'V']).length, 2);
    });
  });

  describe('#findSongTitlesWithSequence', function () {
    it('should return songs that contain a given Mehegan sequence', function () {
      var c1 = chart.create(['A', 'B', 'A'], { A: [['C', 4], ['G7', 4]], B: [['Dm', 4]] }, { title: '1' });
      var c2 = chart.create(['A', 'B', 'A'], { A: [['C', 4]], B: [['G7', 4], ['F', 4]] }, { title: '2' });
      var corp = corpus.create([c1, c2]);

      assert.equal(corp.findSongTitlesWithSequence(['V', 'ii', 'I']).toString(), '1');
      assert.equal(corp.findSongTitlesWithSequence(['V', 'IV', 'I']).toString(), '2');
      assert.equal(corp.findSongTitlesWithSequence(['I', 'V']).toString(), '1,2');
    });
  });

  describe('#countInstancesOfSequence', function () {
    it('should return the number of instances of a given sequence in the corpus', function () {
      var c1 = chart.create(['A', 'B', 'A'], { A: [['C', 4], ['G7', 4]], B: [['Dm', 4]] }, { title: '1' });
      var corp = corpus.create([c1]);

      assert.equal(corp.countInstancesOfSequence(['I', 'V']), 2);
      assert.equal(corp.countInstancesOfSequence(['V', 'ii']), 1);
      assert.equal(corp.countInstancesOfSequence(['V', 'IV']), 0);

      corp = corpus.create([c1, c1]);

      assert.equal(corp.countInstancesOfSequence(['I', 'V']), 4);
      assert.equal(corp.countInstancesOfSequence(['V', 'ii']), 2);
      assert.equal(corp.countInstancesOfSequence(['V', 'IV']), 0);
    });
  });

  describe('#getNGramProbability', function () {
    it('should return the probability of a particular n-gram (Mehegan sequence) appearing in the corpus', function () {
      var c1 = chart.create(['A', 'B', 'A'], { A: [['F', 4], ['C', 4], ['G7', 4]], B: [['Dm', 4], ['G7', 4]] }, { title: '1' });
      var corp = corpus.create([c1]);
      var serialized = corp.serialize();

      assert.equal(corp.getNGramProbability(['I', 'V']), 1);
      assert.equal(corp.getNGramProbability(['V', 'ii']), 1/3);
      assert.equal(corp.getNGramProbability(['V', 'IV']), 2/3);
    });
  });

  describe('#serialize', function () {
    it('should serialize a chart', function () {
      var c = chart.create(['A', 'B', 'A'], { A: [['C7', 4]], B: [['Dm', 4]] }, { foo: 1 });
      var corp = corpus.create([c]);
      var serialized = corp.serialize().charts[0];

      assert.equal(serialized.sections.toString(), c.sections.toString());
      assert.equal(serialized.content.A[0].chord, c.content.A[0].chord.name);
      assert.equal(serialized.content.A[0].duration.beats, c.content.A[0].duration.beats);
      assert.equal(serialized.content.B[0].chord, c.content.B[0].chord.name);
      assert.equal(serialized.content.B[0].duration.beats, c.content.B[0].duration.beats);
      assert.equal(serialized.info.toString(), c.info.toString());
    });
  });

  describe('#load', function () {
    it('should load a chart', function () {
      var serialized = {
        charts: [{
          sections: ['A', 'B', 'A'],
          content: { A: [{chord: 'C7', duration: {beats: 4, subunits: []}}], B: [{chord: 'Dm', duration: {beats: 4, subunits: []}}] },
          info: { foo: 1 }
        }]
      };
      var corp = corpus.load(serialized);

      assert(corp instanceof corpus.Corpus);

      var c = corp.charts[0];
      serialized = serialized.charts[0];

      assert.equal(serialized.sections.toString(), c.sections.toString());
      assert.equal(serialized.content.A[0].chord, c.content.A[0].chord.name);
      assert.equal(serialized.content.A[0].duration.beats, c.content.A[0].duration.beats);
      assert.equal(serialized.content.B[0].chord, c.content.B[0].chord.name);
      assert.equal(serialized.content.B[0].duration.beats, c.content.B[0].duration.beats);
      assert.equal(serialized.info.toString(), c.info.toString());
    });
  });
});