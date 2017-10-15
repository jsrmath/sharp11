# Sharp11
Music theory multitool with a jazz focus

## Introduction
Sharp11 is an npm module for performing music theory operations, ranging from simple things like transposing a note to complicated things like generating an ordered list of scales that can be played over a given chord.  I also built an [interactive web front-end](http://julianrosenblum.com/sharp11-client) to showcase the features of Sharp11, which I encourage you to play around with.

## So what can Sharp11 do?
Sharp11 contains several modules for manipulating everything from notes and durations to entire corpora of jazz charts.  A full list of Sharp11 modules and what they can do is available in the [docs](https://github.com/jsrmath/sharp11/blob/master/docs).  With the exception of the MIDI output option, everything in the core Sharp11 library deals purely with Sharp11 objects.  For audio output, check out the [sharp11-web-audio](https://github.com/jsrmath/sharp11-web-audio) library.

## Sharp11 Ecosystem
The main Sharp11 library can be thought of as the core module of a larger comptuer music ecosystem.  Other libraries in this ecosystem include [sharp11-improv](https://github.com/jsrmath/sharp11-improv), a tool for generating improvisations over jazz chord changes, and [sharp11-jza](https://github.com/jsrmath/sharp11-jza), a probabilistic automaton model for jazz harmony.  The latter makes use of the [iRb corpus](https://musiccog.ohio-state.edu/home/index.php/iRb_Jazz_Corpus), a corpus of over a thousand jazz standards that can be loaded into Sharp11 by installing the [sharp11-irb](https://github.com/jsrmath/sharp11-irb) library.

## Mutability
Methods in Sharp11 do not mutate objects, but instead return new ones.  I feel that in music, a C4 should be a C4, not a reference to an object that might become a D4 at some point.  The same goes for chords, scales, and every other use case I've come across.  There's nothing stopping you from mutating objects in Sharp11, but if you plan to extend any Sharp11 APIs or build anything on top of Sharp11, please try to abide by this rule.

## Install
`npm install sharp11`

## API Documentation
Read the full Sharp11 API documentation [here](https://github.com/jsrmath/sharp11/blob/master/docs).

## Example Music Theory Operations
`var s11 = require('sharp11');`

Transposing a note:

```
s11.note.create('Ab').transpose('P4'); // Db
s11.note.create('Ab').transposeDown('P4'); // Eb
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

Working with scales
```
s11.scale.create('C', 'major'); // C D E F G A B
s11.scale.create('G', 'altered'); // G Ab Bb Cb Db Eb F
s11.scale.create('F', 'melodic minor').descending(); // [F, Eb, Db, C, Bb, Ab, G]
s11.scale.create('C', 'major').transpose('m3'); // Eb F G Ab Bb C D
s11.scale.create('C', 'major').contains('F'); // true
```
