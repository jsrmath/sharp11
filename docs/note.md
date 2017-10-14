# Sharp11 Note Module
`require('sharp11').note`

Contains a [Note](#note-object) object, which can be created with [`note.create()`](#module-create).  Methods of the [Note](#note-object) object do not mutate it, they return a new object.

## <a name="module"></a> Exported Functions
### <a name="module-create"></a> create `.create(note, octave)`
Returns a [Note](#note-object) object given a note name and an optional octave number.  The octave number can also be included in the `note` argument, so `note.create('C', 4)` and `note.create('C4')` do the same thing.

### <a name="module-random"></a> random `.random(range)`
Returns a [Note](#note-object) object given a range (array containing two [Note](#note-object) objects or strings) within which the note must fall.  The notes in the range array must have octave numbers.

### <a name="module-is-note"></a> isNote `.isNote(obj)`
Returns true if an object is a [Note](#note-object).

### <a name="module-from-value"></a> fromValue `.fromValue(value)`
Returns a [Note](#note-object) object given a [note value](#note-value).

### <a name="module-extract"></a> extract `.extract(str)`
Extracts the first valid note from a given string.  For example, "Abm7b5" would return an `A` and "xyzc#5xyz" would return a `C#5`.

## <a name="note-object"></a> Note Object
The `Note` object is the primary building block in Sharp11.  It represents a note with an optional octave number.  Functions that take note objects can always be passed strings instead and they will be automatically converted.  Many functions that take note objects will behave differently depending on whether or not the note has an octave number.  The `Note` constructor is accessible directly as `.Note`, however new instances should be created using [`.create()`](#module-create) instead.

### <a name="note-name"></a> name `.name`
The name of the note, e.g., "Ab".

### <a name="note-fullName"></a> fullName `.fullName`
The name of the note with the octave number if there is one, e.g., "Ab4".

### <a name="note-letter"></a> letter `.letter`
The letter of the note, e.g., "C".

### <a name="note-acc"></a> accidental `.acc` or `.accidental`
The accidental of the note, i.e., "#", "b", "n", "##", or "bb".

### <a name="note-octave"></a> octave `.octave`
The (optional) octave number of the note, i.e., an integer between 0 and 9, or `null`.

### <a name="note-key-type"></a> keyType `.keytype`
"#" for sharp keys, "b" for flat keys, `null` for C.

### <a name="note-value"></a> value `.value()`
Returns an integer representing the note if it has an octave number or `null` otherwise.  Enharmonically equivalent notes in the same octave have the same value.  This value is the same as the MIDI note value.

### <a name="note-sharp"></a> sharp `.sharp()`
Sharps the note, without doing any cleanup.  This means a "C#" becomes a "C##" and a "C##" becomes a "D#".  For a more useful result, call [`.clean()`](#note-clean) on the result.

### <a name="note-flat"></a> flat `.flat()`
Flats the note, without doing any cleanup.  This means a "Bb" becomes a "Bbb" and a "Bbb" becomes an "Ab".  For a more useful result, call [`.clean()`](#note-clean) on the result.

### <a name="note-shift"></a> shift `.shift(halfSteps)`
Shifts the note by a given number of half steps, positive or negative, without doing any cleanup.  For a more useful result, call [`.clean()`](#note-clean) on the result.

### <a name="note-clean"></a> clean `.clean()`
Respells a note, getting rid of double accidentals, B#/Cb, and E#/Fb.

### <a name="note-with-accidental"></a> withAccidental `.withAccidental(acc)`
Returns an enharmonically equivalent note with a given accidental ('#', 'b', or 'n') if possible.

### <a name="note-get-interval"></a>getInterval `.getInterval(note)`
Returns the interval to a given note ([Note](#note-object) object or string) as an [Interval](interval.md#interval-object).  Octave numbers are ignored, so `note.create('C4').getInterval('G4')` and `note.create('C4').getInterval('G5')` will both return a perfect fifth.

### <a name="note-transpose"></a> transpose `.transpose(interval, down)`
Transposes the note by an interval (string or [Interval](interval.md#interval-object) object).  The interval will be transposed up unless `down` is truthy.

Octave numbers will be taken into account, and intervals up to a 14th are supported.  For example, `note.create('C4').transpose('P11')` will return an F5.

### <a name="note-transpose-down"></a> transposeDown `.transposeDown(interval)`
Calls `.transpose(interval, true)`.

### <a name="note-toggle-accidental"> toggleAccidental `.toggleAccidental()`
Toggles the accidental of the note.  For example: C# becomes Db, E# becomes F, and F## becomes G.

### <a name="note-in-octave"></a> inOctave `.inOctave(octave)`
Returns the note in a given octave number.

### <a name="note-enharmonic"> enharmonic `.enharmonic(note)`
Returns true if the note is enharmonic to a given note ([Note](#note-object) object or string), ignoring octave numbers.

### <a name="note-lower-than"></a> lowerThan `.lowerThan(note)`
Returns true if the note is lower than a given note ([Note](#note-object) object or string).  If both notes have octave numbers, those octave numbers are used.  Otherwise, it is assumed both notes have the same octave number.

### <a name="note-higher-than"></a> higherThan `.higherThan(note)`
Returns true if the note is higher than a given note ([Note](#note-object) object or string).  If both notes have octave numbers, those octave numbers are used.  Otherwise, it is assumed both notes have the same octave number.

### <a name="note-equals"></a> equals `.eq(note)` or `.equals(note)`
Returns true if the note has the same letter and accidental as a given note ([Note](#note-object) object or string).  If both notes have octave numbers, those octave numbers are used.  Otherwise, it is assumed both notes have the same octave number.

### <a name="note-get-half-steps"></a> getHalfSteps `.getHalfSteps(note)`
Returns the number of half steps between note and a given note ([Note](#note-object) object or string).

### <a name="note-contained-in"></a> containedIn `.containedIn(arr)`
Returns true if note is enharmonic to any note in a given array of notes ([Note](#note-object) objects or strings).  Octave numbers are taken into account if both notes being compared have them, so `note.create('C4').containedIn(['C', 'D', 'E'])` returns true but `note.create('C4').containedIn(['C5', 'D5', 'E5'])` returns false.

### <a name="note-in-range"></a> inRange `.inRange(range)`
Returns true if note is in a given range (inclusive).  `range` is an array containing two elements, a lower bound and an upper bound ([Note](#note-object) objects or strings).  `.inRange()` uses [`.lowerThan()`](#note-lower-than) and [`.higherThan()`](#note-higher-than) internally, so the same rules regarding octave numbers apply.
