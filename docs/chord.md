# Sharp11 Chord Module
`require('sharp11').chord`

Contains a [Chord](#chord-object) object, which can be created with [`chord.create()`](#module-create).  Methods of the [Chord](#chord-object) object do not mutate it, they return a new object.

## <a name="module"></a> Exported Functions
### <a name="module-create"></a> create `.create(chord, octave)`
Returns a [Chord](#chord-object) object given a string and an optional octave number.  The `chord` argument should contain the root of the chord, an optional symbol (defaults to major triad), and an optional bass note given in slash notation.  Sharp11 supports a wide variety of chord symbols, so anything you'd find in a jazz fake book should be valid here.

### <a name="module-identify"></a> identify `.identify(notes...)`
Returns the chord name as a string given an argument list of [Note](note.md#note-object) objects or strings, ignoring octave numbers.  Inversions are supported, so `chord.identify('B', 'C', 'Eb', 'G')` returns "CmM7/B".

### <a name="module-identify-array"></a> identifyArray `.identifyArray([notes])`
Invokes `.identify()` with the contents of `[notes]` as its arguments.

### <a name="module-get-possible-chord-names"></a> getPossibleChordNames `.getPossibleChordNames(notes...)`
Returns a list of chord names given an argument list of [Note](note.md#note-object) objects or strings, ignoring octave numbers. Similar to `.identify(notes...)`, but returns all possible matches. Matches are sorted by how "reasonable" they are, with reasonable ones coming first in the list.

### <a name="module-get-possible-chord-names-from-array"></a> getPossibleChordNamesFromArray `.getPossibleChordNamesFromArray([notes])`
Invokes `.getPossibleChordNames()` with the contents of `[notes]` as its arguments.

### <a name="module-is-chord"></a> isChord `.isChord(obj)`
Returns true if an object is a [Chord](#chord-object).

## <a name="chord-object"></a> Chord Object
`Chord` objects consist of a root, a chord symbol, and an optional bass (meaning the lowest note in the chord is not the root).  The chord symbol is parsed, producing an array of notes that make up the chord.  A `Chord` object can have an optional octave number, which is applied to the notes of the chord, starting with the first note and increasing accordingly.  For example, the notes in a C13 in octave 4 are C4, E4, G4, Bb4, D5, F5, A5.  The `Chord` constructor is accessible directly as `.Chord`, however new instances should be created using [`.create()`](#module-create) instead.

### <a name="chord-name"></a> name `.name`
The chord name, given by the `chord` argument in [`chord.create()`](#module-create).

### <a name="chord-root"></a> root `.root`
A [Note](note.md#note-object) object representing the root of the chord.

### <a name="chord-symbol"></a> symbol `.symbol`
A string containing the symbol of the chord (no root or bass).

### <a name="chord-formatted-symbol"></a> formattedSymbol `.formattedSymbol`
A string containing the symbol of the chord (no root or bass) with aliases replaced, e.g. '-' becomes 'm'.

### <a name="chord-bass"></a> bass `.bass`
A [Note](note.md#note-object) object representing the bass of the chord.

### <a name="chord-chord"></a> chord `.chord`
An array of [Note](note.md#note-object) objects representing the notes in the chord, with optional octave numbers.

### <a name="chord-octave"></a> octave `.octave`
The (optional) octave number of the chord, i.e., an integer between 0 and 9, or `null`.

### <a name="chord-scales"></a> scales `.scales()`
Returns an array of [`scale`](scale.md#scale-object) objects representing scales that could be played over the chord.  A [`scale`](scale.md#scale-object) can be played over a chord if every note contained in the chord is contained in the scale (with a few optimizations).  The returned array of scales is ordered based on a pre-defined "precedence" array, which orders scales based on how commonly used they are.

### <a name="chord-scale"></a> scale `.scale()`
Returns the first element of the array returned by [`.scales()`](#chord-scales).

### <a name="chord-scale-names"></a> scaleNames `.scaleNames()`
Returns the names of the [`scales`](scale.md#scale-object) returned by [`.scales()`](#chord-scales).

### <a name="chord-transpose"></a> transpose `.transpose(interval, down)`
Transposes the chord, applying [`note.transpose()`](note.md#note-transpose).

### <a name="chord-transpose-down"></a> transposeDown `.transposeDown(interval)`
Calls `.transpose(interval, true)`.

### <a name="chord-clean"></a> clean `.clean()`
Applies [`note.clean()`](note.md#note-clean) to the root, bass, and every note in the chord.

### <a name="chord-contains"></a> contains `.contains(note)`
Returns true if the given note is in the chord, following the rules of [`note.containedIn()`](note.md#note-contained-in).

### <a name="chord-in-octave"></a> inOctave `.inOctave(octave)`
Assigns the chord the given octave number.
