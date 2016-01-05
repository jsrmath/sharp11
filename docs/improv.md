# Sharp11 Improv Module
`require('sharp11').improv`

Contains an [Improv](#improv-object) object, which can be created with [`improv.create()`](#module-create), and an [ImprovChart](#improv-chart-object) object, which is returned by passing a [ChordChart](chord.md#chord-chart-object) object to the [`over()`](#improv-over) method of an [Improv](#improv-object) object.

## <a name="module"></a> Exported Functions
### <a name="module-create"></a> create `.create(settings)`
Returns an [Improv](#improv-object) object given an optional settings object.  The settings object can contain any of the following properties:
* `dissonance` - A number (0 to 1) or a numerical range.  A higher value means the improv engine is more likely to select a less common / more dissonant scale according to [scale precedence](scale.md#module-precedence).  Default value is `0.5`.
* `changeDir` - A number (0 to 1) or a numerical range.  A higher value means the improv engine is more likely to change directions while traversing up or down a scale.  The probability of changing direction is equal to the value of `changeDir`.  Default value is `0.25`.
* `jumpiness` - A number (0 to 1) or a numerical range.  A higher value means the improv engine is more likely to jump to a random note in the current scale.  The probability of jumping is equal to the value of `jumpiness`.  Default value is `0.25`.
* `rests` - A number (0 to 1) or a numerical range.  A higher value means the improv engine is more likely to insert a rest (currently the same as extending the previous note).  The probability of inserting a rest is equal to the value of `rests`.  Default value is `[0.35, 0]`.
* `rhythmicVariety` - A number (0 to 1) or a numerical range.  A higher value means the improv engine is more likely to use triplets or sixteenths rather than eighth notes.  The probabilities of the improv engine inserting a measure of triplets or a measure of sixteenth notes are each one third the value of `rhythmicVariety`.  Default value is `[0, 0.75]`.
* `useSixteenths` - A boolean.  If false, the improv engine will not use sixteenth notes and the probability of it using triplets becomes half the value of `rhythmicVariety`.  Default value is `true`.
* `onlyEighthRests` - A boolean.  If true, the improv engine will only put rests in measures of eighth notes and not in measures of triplets of sixteenth notes.  Default value is `false`.
* `range` - An array containing two [Note](note.md#note-object) objects or strings.  The improv engine will only use notes within the given range (inclusive).  Default value is `['C4', 'C6']`.

Note: Some settings can take a numerical range instead of a number.  A numerical range is given as an array containing two values.  When improvising, the improv engine starts with the value set to the first element of the array and adjusts it linearly throughout the improvisation, reaching the second value by the end of the improvisation.

### <a name="module-isImprovChart"></a> isImprovChart `.isImprovChart(object)`
Returns true if a given object is an [ImprovChart](#improv-chart-object).

## <a name="improv-object"></a> Improv Object
`Improv` objects are used to create improvisations.

### <a name="improv-over"></a> over `.over(type, obj)`
Improvises over an object given a string representing its `type`.  The object returned depends on the type of the object given.  Currently, the only supported type for improvising is a [ChordChart](chord.md#chord-chart-object) objects, given by a `type` of `chart` or `chordChart`.  Improvising over a [ChordChart](chord.md#chord-chart-object) returns an [ImprovChart](#improv-chart-object).

## <a name="improv-chart-object"></a> ImprovChart Object
An `ImprovChart` represents an improvisation over a [ChordChart](chord.md#chord-chart-object).

### <a name="improv-chart-chart"></a> chart `.chart`
An array of objects representing the notes that have been improvised for a given chord change.  Each object contains the following properties:
* `chord` - A [Chord](chord.md#chord-object) object representing the chord change.
* `scale` - A [Scale](scale.md#scale-object) object representing the scale that was chosen for improvising over the chord change.
* `notes` - An array of beats.  Each beat is an array of two (eighth), three (triplet), or four (sixteenth) notes.  Notes can either be [Note](note.md#note-object) objects or `null`, representing rests.
* `duration` - The duration of the chord change represented as a [note duration](../docs/README.md#note-duration).

### <a name="improv-chart-chordScales"></a> chordScales `.chordScales`
An array of objects representing the notes in the improvisation.  Each object contains the following properties:
* `note` - A [Note](note.md#note-object) object or null, representing a rest.
* `duration` - The duration of the note represented as a [note duration](../docs/README.md#note-duration).

### <a name="improv-chart-midi"></a> midi `.midi(filename, options)`
Outputs a MIDI file of the improvisation with a name given by `filename` and on an [`options` object](midi.md#midi-options).
