# Sharp11
Music theorization and improvisation engine

## Introduction
Sharp11 is an engine for performing music theory operations, ranging from simple things like transposing a note to complicated things like generating an ordered list of scales that can be played over a given chord.  Sharp11 has gone through several iterations since I first thought of it in 2011 or so.

## Mutability
Methods in Sharp11 do not mutate objects, but instead return new ones.  I feel that in music, a C4 should be a C4, not a reference to an object that might become a D4 at some point.  The same goes for chords, scales, and every other use case I've come across.  There's nothing stopping you from mutating objects in Sharp11, but if you plan to extend any Sharp11 APIs, please try to abide by this rule.

## API Documentation
Read the full Sharp11 API documentation [here](docs).

## Example Music Theory Operations
`var s11 = require('sharp11');`

Transposing a note:

```
s11.note.create('Ab').transpose('P4'); // Db
s11.note.create('Ab').transpose('P4', true); // Eb (transposed down)
s11.note.create('Ab3').transpose('P4'); // Db4
```

Finding the interval between two notes:

```
s11.note.create('C').getInterval('F#'); // aug4
s11.note.create('F').getInterval('Abb'); // dim3
```

Parsing a chord symbol:
```
s11.chord.create('G'); // G B D
s11.chord.create('Am7b5'); // A C Eb G
s11.chord.create('Cmaj7/B'); // B C E G
s11.chord.create('F/G'); // G F A C
s11.chord.create('CmM9#11'); // C Eb G B D F#
```

Identifying a chord:
```
s11.chord.identify('C', 'Eb', 'G', 'A'); // Cm6
s11.chord.identify('A', 'C', 'Eb', 'F'); // F7/A
s11.chord.identify('G', 'B', 'D#', 'F', 'A#'); // G7#5#9
s11.chord.identify('F#', 'C', 'Eb', 'G', 'B', 'D'); // CmM9#11/F#
```

Creating a scale
```
s11.scale.create('C', 'major'); // C D E F G A B
s11.scale.create('G', 'altered'); // G Ab Bb Cb Db Eb F
s11.scale.create('F', 'mixolydian b6', true); // F Eb Db C Bb A G
s11.scale.create('Eb', 'melodic minor'); // Eb F Gb Ab Bb C D
s11.scale.create('Eb', 'melodic minor', true); // Eb Db Cb Bb Ab Gb F
```
