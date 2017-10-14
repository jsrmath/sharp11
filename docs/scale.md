# Sharp11 Scale Module
`require('sharp11').scale`

Contains a [Scale](#scale-object) object, which can be created with [`scale.create()`](#module-create), and a [TraversableScale](#traversable-scale-object) object, which can be created by calling [`.traverse()`](#scale-traverse) on a [Scale](#scale-object) object.  Methods of these objects do not mutate them, they return a new objects.

## <a name="module"></a> Exported Functions
### <a name="module-scales"></a> scales `.scales`
An object mapping scale names to arrays.  Each array contains strings representing the intervals in the scale, not including the root.

### <a name="module-precedence"></a> precedence `.precedence`
An array of scale names in order of how commonly used they are.  This order is used in the [`.scales()`](chord.md#chord-scales) method of the [Chord](chord.md#chord-object) object.

### <a name="module-create"></a> create `.create(key, scaleName)`
Returns a [Scale](#scale-object) object.  `key` is a [Note](note.md#note-object) object or string representing the key (or root) of the scale.  `scaleName` is a string containing the name of the scale.  `scaleName` is converted to lowercase and spaces are replaced with underscores.  Sharp11 supports a wide variety of scales as well as aliases, so `Superlocrian`, `Altered`, and `Diminished Whole Tone` will all work.

### <a name="module-is-scale"></a> isScale `.isScale(obj)`
Returns true if an object is a [Scale](#scale-object) or a [TraversableScale](#traversable-scale-object).

### <a name="module-is-traversable"></a> isTraversable `.isTraversable(object)`
Returns true if a given object is a [TraversableScale](#traversable-scale-object).

## <a name="scale-object"></a> Scale Object
`Scale` objects consist of a key and a scale name.  A `Scale` may or may not have octave numbers depending on whether or not the `key` parameter does.  Octave numbers behave as expected, so a major scale with a key of G4 will contain the notes G4, A4, B4, C5, D5, E5, F#5.  The `Scale` constructor is accessible directly as `.Scale`, however new instances should be created using [`.create()`](#module-create) instead.

### <a name="scale-key"></a> key `.key` or `.root`
A [Note](note.md#note-object) object representing key of the scale.

### <a name="scale-name"></a> name `.name`
A string representing the name of the scale (capitalized, spaces between words), e.g., "Harmonic Minor".  `.name` should not be used for comparing scales, because `scale.create('minor')` and `scale.create('natural minor')` will produce the same scale but with different `.name`s.

### <a name="scale-id"></a> id `.id`
A string representing the name of the scale (lowercase, underscores between words), e.g., "harmonic_minor"  `.id`s are one-to-one with scales and thus can be used for comparison.

### <a name="scale-full-name"></a> fullName `.fullName`
A string representing the name of the scale including the key, e.g., "Bb Harmonic Minor".

### <a name="scale-octave"></a> octave `.octave`
The (optional) octave number of the scale, i.e., an integer between 0 and 9, or `null`.

### <a name="scale-scale"></a> scale `.scale`
An array of [Note](note.md#note-object) objects representing the notes in the scale, e.g., `[C, D, E, F, G, A, B]`

### <a name="scale-intervals"></a> intervals `.intervals`
An array of [Interval](interval.md#interval-object) objects representing the intervals in the scale, including the root.

### <a name="scale-descending"></a> descending `.descending()`
Returns an array of [Note](note.md#note-object) objects representing the notes in the scale descending, starting with the root.  `.descending()` takes into account the abnormal nature of the [melodic minor](http://www3.northern.edu/wieland/theory/scales/mi_mel.htm).

### <a name="scale-clean"></a> clean `.clean()`
Applies [`note.clean()`](note.md#note-clean) to the key and all the notes in the scale.

### <a name="scale-transpose"></a> transpose `.transpose(interval, down)`
Transposes the scale, applying [`note.transpose()`](note.md#note-transpose).

### <a name="scale-transpose-down"></a> transposeDown `.transposeDown(interval)`
Calls `.transpose(interval, true)`.

### <a name="scale-nearest"></a> nearest `.nearest(note)`
Returns a [Note](note.md#note-object) representing the nearest note on the scale to a given note ([Note](note.md#note-object) object or string).  Octave numbers are ignored.  If there are two nearest notes, the lower will be returned.

### <a name="scale-contains"></a> contains `.contains(note)`
Returns true if the given note is in the scale, following the rules of [`note.containedIn()`](note.md#note-contained-in).

### <a name="scale-in-octave"></a> inOctave `.inOctave(octave)`
Returns the scale in a given octave number.

### <a name="scale-has-interval"></a> hasInterval `.hasInterval(interval)`
Returns true if a given interval ([Interval](interval.md#interval-object) object or string) is in the scale.

### <a name="scale-traverse"></a> traverse `.traverse(note)`
Returns a [TraversableScale](#traversable-scale-object) whose current note is the given note ([Note](note.md#note-object) object or string).  The given note must have an octave number.

## <a name="traversable-scale-object"></a> TraversableScale Object
`TraversableScale` objects contain a scale and a current index and are created by calling [`.traverse()`](#scale-traverse) on a [Scale](#scale-object) object.  `TraversableScale`s can be thought of as a combination of a note and a scale and allow you to easily traverse the scale, as the name implies.  They are instrumental (pun intended) in Sharp11's [improvisation engine](improv.md).  The `TraversableScale` constructor is accessible directly as `.TraversableScale`, however new instances should be created by calling [`.traverse()`](#scale-traverse) on a [Scale](#scale-object) object instead.

### <a name="traversable-scale-scale"></a> scale `.scale`
A [Scale](#scale-object) object representing the scale.

### <a name="traversable-scale-index"></a> index `.index`
The index of the scale's current note, starting at 0.  `.index` is mostly used internally, whereas [`.current()`](#traversable-scale-current) returns the actual note.

### <a name="traversable-scale-octave"></a> octave `.octave`
Returns the octave number that the scale is currently in.  This is the same as the octave number of the scale's root.

### <a name="traversable-scale-length"></a> length `.length`
The number of notes in one octave of the scale, equal to `.scale.scale.length`.

### <a name="traversable-scale-name"></a> name `.name`
See [`.name`](#scale-name).

### <a name="traversable-scale-id"></a> id `.id`
See [`.id`](#scale-id).

### <a name="traversable-scale-full-name"></a> fullName `.fullName`
See [`.fullName`](#scale-full-name).

### <a name="traversable-scale-current"></a> current `.current()`
Returns a [Note](note.md#note-object) object representing the scale's current note.

### <a name="traversable-scale-clean"></a> clean `.clean()`
See [`.clean()`](#scale-clean).

### <a name="traversable-scale-transpose"></a> transpose `.transpose(interval, down)`
See [`.transpose()`](#scale-transpose).

### <a name="traversable-scale-transpose-down"></a> transposeDown `.transposeDown(interval)`
See [`.transposeDown()`](#scale-transpose-down).

### <a name="traversable-scale-shift"></a> shift `.shift(numSteps)`
Shifts the current note of the scale by a given number of positions, positive or negative.  The resulting scale may have a different octave number depending on how far it has been shifted.

### <a name="traversable-scale-shift-interval"></a> shiftInterval `.shiftInterval(interval, down)`
Shifts the current note of the scale by a given interval, applying [`note.transpose()`](note.md#note-transpose).  The resulting scale may have a different octave number depending on how far it has been shifted.  Throws an error if the transposed note is not in the scale.

### <a name="traversable-scale-random"></a> random `.random()`
Makes the current note of the scale a random note in the scale.

### <a name="traversable-with-current"></a> withCurrent `.withCurrent(note)`
Makes the current note of the scale the given note ([Note](note.md#note-object) object or string).

### <a name="traversable-scale-nearest"></a> nearest `.nearest(note)`
See [`.nearest()`](#scale-nearest).

### <a name="traversable-scale-contains"></a> contains `.contains(note)`
See [`.contains()`](#scale-contains).

### <a name="traversable-scale-has-interval"></a> hasInterval `.hasInterval(interval)`
See [`.hasInterval()`](#scale-has-interval).

### <a name="traversable-descending"></a> descending `.descending()`
See [`.descending()`](#scale-descending).
