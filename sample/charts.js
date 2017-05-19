var chart = require('../lib/chart');

module.exports.myFunnyValentine = chart.create(['A', 'A2', 'B', 'C'], {
  A: [
    ['C-', 4],
    ['C-M7/B', 4],
    ['C-7/Bb', 4],
    ['F7', 4],
    ['AbM7', 4],
    ['F-7', 4],
    ['D-7b5', 4],
    ['G7#5', 4]
  ],
  A2: [
    ['C-', 4],
    ['C-M7/B', 4],
    ['C-7/Bb', 4],
    ['F7', 4],
    ['AbM7', 4],
    ['C-9', 4],
    ['Fdim7', 4],
    ['Bb7b9', 4]
  ],
  B: [
    ['EbM7', 2],
    ['F-7', 2],
    ['EbM7/G', 2],
    ['F-7', 2],
    ['EbM7', 2],
    ['F-7', 2],
    ['EbM7/G', 2],
    ['F-7', 2],
    ['EbM7', 2],
    ['G+7', 2],
    ['C-', 2],
    ['Bb-7', 1],
    ['A7', 1],
    ['AbM7', 4],
    ['D-7b5', 2],
    ['G7#5', 2]
  ],
  C: [
    ['C-', 4],
    ['C-M7/B', 4],
    ['C-7/Bb', 4],
    ['F7', 4],
    ['AbM7', 4],
    ['D-7b5', 2],
    ['G7#5', 2],
    ['C-', 2],
    ['C-M7/B', 2],
    ['C-7/Bb', 2],
    ['A-7b5', 2],
    ['AbM7', 4],
    ['Fdim7', 2],
    ['Bb7b9', 2],
    ['EbM7', 8]
  ]
}, { title: 'My Funny Valentine' });

module.exports.takeTheATrain = chart.createSingleton([
  ['C6', 8],
  ['D7#5', 8],
  ['Dm7', 4],
  ['G9', 4],
  ['C6', 4],
  ['Dm7', 2],
  ['G7/Db', 2]
], { title: 'Take The A Train' });

module.exports.goodbyePorkPieHat = chart.createSingleton([
  ['F7#9', 2],
  ['Db13', 2],
  ['GbM7', 2],
  ['B7', 2],
  ['Eb11', 2],
  ['Db13', 2],
  ['Eb11', 2],
  ['F7', 2],
  ['Bbm11', 2],
  ['Db13', 2],
  ['Gm11', 2],
  ['C7#9', 2],
  ['Ddim7', 2],
  ['G13', 2],
  ['Db7', 2],
  ['GbM7', 2],
  ['B13', 2],
  ['Bb7', 2],
  ['C7#5', 2],
  ['Eb7#5', 2],
  ['F7#9', 2],
  ['Db7', 2],
  ['GbM7', 2],
  ['B7b5', 2]
], { title: 'Goodbye Pork Pie Hat' });

module.exports.giantSteps = chart.createSingleton([
  ['B', 2],
  ['D7', 2],
  ['G', 2],
  ['Bb7', 2],
  ['Eb', 4],
  ['Am7', 2],
  ['D7', 2],
  ['G', 2],
  ['Bb7', 2],
  ['Eb', 2],
  ['F#7', 2],
  ['B', 4],
  ['Fm7', 2],
  ['Bb7', 2],
  ['Eb', 4],
  ['Am7', 2],
  ['D7', 2],
  ['G', 4],
  ['C#m7', 2],
  ['F#7', 2],
  ['B', 4],
  ['Fm7', 2],
  ['Bb7', 2],
  ['Eb', 4],
  ['C#m7', 2],
  ['F#7', 2]
], { title: 'Giant Steps' });
