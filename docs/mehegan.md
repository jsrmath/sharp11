# Sharp11 Mehegan Module
`require('sharp11').mehegan`

Contains a [Mehegan](#mehegan-object) object, which can be created with [`mehegan.fromChord()`](#module-from-chord) or [`mehegan.fromString()`](#module-from-string).  Methods of the [Mehegan](#mehegan-object) object do not mutate it, they return a new object.

## <a name="module"></a> Exported Functions
### <a name="module-from-chord"></a> fromChord `.fromChord(key, chord)`
Given a key (string or [Note](note.md#note-object) object) and a chord (string or [Chord](chord.md#chord-object) object), return a [Mehegan](#mehegan-object) object representing the given chord in the given key.  For example, `mehegan.fromChord('G', 'B7')` returns `IIIx`.

### <a name="module-from-string"></a> fromString `.fromString(sym)`
Given a string representation of a Mehegan symbol, e.g., "IIIx", return the corresponding [Mehegan](#mehegan-object) object.  If no quality is given, the quality will be inferred diatonically.

### <a name="module-from-chords"></a> fromChords `.fromChords(key, chords)`
Given a key (string or [Note](note.md#note-object) object) and an array of chords (string or [Chord](chord.md#chord-object) object), return an array of [Mehegan](#mehegan-object) objects representing each chord in the given key.

### <a name="module-from-strings"></a> fromStrings `.fromStrings(sym)`
Given an array of string representations of Mehegan symbols, return an array of corresponding [Mehegan](#mehegan-object) objects.

### <a name="module-as-mehegan"></a> asMehegan `.asMehegan(obj, cache)`
If the given object is a [Mehegan](#mehegan-object) object, return it, otherwise parse it as a Mehegan string.  If an object is passed in as the optional cache parameter, it will be used to cache Mehegan objects created for corresponding Mehegan strings.  That means that if `.asMehegan()` is called twice with the same string, the results will point to the same cached [Mehegan](#mehegan-object) object.  The purpose of allowing an optional cache is to increase performance for `.asMehegan` and functions that invoke it such as [`Mehegan.eq()`](#mehegan-eq).

### <a name="module-as-mehegan-array"></a> asMeheganArray `.asMeheganArray(arr, cache)`
Returns an array resulting from invoking `.asMehegan` with each element and the optional cache.

## <a name="mehegan-object"></a> Mehegan Object
The `Mehegan` object represents a Mehegan symbol, i.e., a roman numeral representation of a jazz chord based on John Mehegan's Sixty Chord System (extended slightly by introducing a separate quality for suspended chords).  Mehegan symbols have a roman numeral and a chord quality, which is one of: `M` (major), `m` (minor), `x` (dominant), `ø` (half-diminished), `o` (diminished), or `s` (suspended).  Additional chord alterations are ignored when converting to Mehegan symbols.  The `Mehegan` constructor is accessible directly as `.Mehegan`, however new instances should be created using [`.fromString()`](#module-from-string) or [`.fromChord()`](#module-from-chord) instead.

### <a name="mehegan-numeral"></a> numeral `.numeral`
The roman numeral of the Mehegan symbol, e.g., "VI".

### <a name="mehegan-quality"></a> quality `.quality`
The quality of the Mehegan symbol ("M", "m", "x", "ø", "o", or "s").

### <a name="mehegan-interval"></a> intveral `.interval`
The number of half-steps between the Mehegan symbol and `I`.  For example, `mehegan.fromString('V').interval` returns 7.

### <a name="mehegan-equals"></a> equals `.eq(sym, cache)` or `.equals(sym, cache)`
Given a string or [Mehegan](#mehegan-object) object, return true if it has the same quality and is enharmonically equivalent.  The optional cache parameter, if provided, will be passed into the [`.asMehegan()`](#module-as-mehegan) function.

### <a name="mehegan-to-interval"></a> toInterval `.toInterval()`
Return an [Interval](interval.md#interval-object) object corresponding to the roman numeral.  For example, `mehegan.fromString('bIIIx').toInterval()` returns `m3`.

### <a name="mehegan-transpose"></a> transpose `.transpose(interval, down)`
Transposes the Mehegan symbol by an interval (string or [Interval](interval.md#interval-object) object).  The interval will be transposed up unless `down` is truthy.

### <a name="mehegan-transpose-down"></a> transposeDown `.transposeDown(interval)`
Calls `.transpose(interval, true)`.

### <a name="mehegan-with-quality"></a> withQuality `.withQuality(quality)`
Returns a Mehegan symbol with the same numeral and the given quality.

### <a name="mehegan-to-chord"></a> toChord `.toChord(key)`
Returns a [Chord](chord.md#chord-object) object that corresponds to the Mehegan symbol in a given key (string or [Note](note.md#note-object) object).

### <a name="mehegan-to-stylized"></a> toStylized `.toStylized()`
Returns a string representation of the Mehegan symbol where case-sensitive roman numerals are used and qualities are omitted for diatonic chords.
