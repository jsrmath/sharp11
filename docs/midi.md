# Sharp11 Midi Module
`require('sharp11').midi`

Contains a [Midi](#midi-object) object, which can be created with [`midi.create()`](#module-create), and some helpful functions for dealing with MIDI data that are used internally.

## <a name="module"></a> Exported Functions
### <a name="module-create"></a> create `.create(type, source, settings)`
Returns a [Midi](#midi-object) object given a `type` (`"improvChart"` or `"chordChart"`), a `source` (Sharp11 object of specified type to be converted to MIDI) an optional settings object.  `midi.create()` is called by the `.midi()` methods of Sharp11 objects internally and is usually not used directly.  The settings object can contain any of the following properties:
<a name="midi-settings"></a>
* `tempo` - The tempo in beats per minute.  Default value is 120.
* `swingRatio` - A number (1 to 3) representing the ratio of the first note to the second note for swing eighth notes.  `1` yields straight eighth notes.  `1.5` yields a swing feel.  `2` yields a triplet feel.  `3` yields a dotted feel.  Default value is `1.5`.
* `melodyPatch` - A number (1 to 128) representing the [midi patch](https://www.midi.org/specifications/item/gm-level-1-sound-set) of the melody instrument.  Default value is 57 (Trumpet).
* `chordPatch` - A number (1 to 128) representing the [midi patch](https://www.midi.org/specifications/item/gm-level-1-sound-set) of the chord instrument.  Default value is 1 (Acoustic Grand Piano).
* `noteVelocity` - A number (1 to 127) representing the velocity with which melody notes are played.  Default value is 80.
* `chordVelocity` - A number (1 to 127) representing the velocity with which chords are played.  Default value is 60.
* `chordOctave` - A number (1 to 6) representing the octave in which chords should be played.  Default value is 4.

### <a name="module-noteLength"></a> noteLength `.noteLength(duration, settings)`
Given a [note duration](../docs/README.md#note-duration) and a [`settings`](#midi-settings) object, returns the number of ticks for that note (assuming 96 ticks per beat).

### <a name="module-makeVLQ"></a> makeVLQ `.makeVLQ(num)`
Given a number, returns a Buffer with that number represented as a MIDI-compatible [Variable-Length Quantity](https://en.wikipedia.org/wiki/Variable-length_quantity) (VLQ).

### <a name="module-noteValue"></a> noteValue `.noteValue(note)`
Given a [Note](note.md#note-object) object, return its MIDI number.

## <a name="midi-object"></a> Midi Object
`Midi` objects are used to handle MIDI representations of chord charts and improvisations.

### <a name="midi-type"></a> type `.type`
A string representing the type of object that produced the MIDI output.  Currently supports `"improvChart"` and `"chordChart"`.

### <a name="midi-source"></a> source `.source`
The Sharp11 object that produced the MIDI output.

### <a name="midi-settings"></a> settings `.settings`
The [`settings`](#midi-settings) that yielded the MIDI output.

### <a name="midi-data"></a> data `.data`
A Buffer containing the raw MIDI data.

### <a name="midi-write"></a> write `.write(filename, callback)`
Asynchronously write the MIDI output to a file.  Server-side only.

### <a name="midi-writeSync"></a> writeSync `.writeSync(filename)`
Synchronously write the MIDI output to a file.  Server-side only.
