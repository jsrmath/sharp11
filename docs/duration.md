# Sharp11 Duration Module
`require('sharp11').duration`

Contains a [Duration](#duration-object) object, which can be created with [`duration.beats()`](#module-beats), [`duration.subunit()`](#module-subunit), or [`duration.asDuration()`](#module-as-duration).  Methods of the [Duration](#duration-object) object do not mutate it, they return a new object.

## <a name="module"></a> Exported Functions
### <a name="module-beats"></a> beats `.beats(num)`
Returns a [Duration](#duration-object) object representing a given number of beats.

### <a name="module-subunit"></a> subunit `.subunit(unit...)`
Returns a [Duration](#duration-object) object given one or more subunits expressed as string arguments to the function.  Subunits represent durations that are smaller than a beat.  For example, `duration.subunit('eighth', 'sixteenth')` returns a dotted eighth duration.  Acceptable subunits are: `eighth`, `longEighth`, `shortEighth`, `sixteenth`, and `triplet`.  `longEighth` and `shortEighth` represent explicit durations for swing eighths.

### <a name="module-is-duration"></a> isDuration `.isDuration(obj)`
Returns true if a given object is a [Duration](#duration-object) object.

### <a name="module-as-duration"></a> asDuration `.asDuration(val)`
Returns the given value as a [Duration](#duration-object) object.  If the value is already a [Duration](#duration-object) object, it will be returned.  If the value is a number, it will be interpreted number of beats.  Otherwise, the arguments will be interpreted as subunits.

## <a name="duration-object"></a> Duration Object
The `Duration` object represents a duration for a note or chord.  `Duration` objects contain a number of beats and/or a list of subunits, all of which are added together to produce the duration's value.  The `Duration` constructor is accessible directly as `.Duration`, however new instances should be created using [`.beats()`](#module-beats), [`.subunit()`](#module-subunit), or [`.asDuration()`](#module-as-duration) instead.

### <a name="duration-beats"></a> beats `.beats`
The number of explicit beats in the duration.

### <a name="duration-subunits"></a> subunits `.subunits`
An array of the subunits in the duration.

### <a name="duration-value"></a> value `.value(swingRatio)`
The total value of the duration including beats and subunits.  For example, `duration.beats(2).addSubunit('eighth').value()` returns `2.5`.  An optional `swingRatio` parameter sets the ratio between `longEighth` and `shortEighth`.  The default `swingRatio` is `1.5`.

### <a name="duration-add-beats"></a> addBeats `.addBeats(num)`
Adds the given number of beats to the duration.

### <a name="duration-add-subunit"></a> addSubunit `.addSubunit(unit...)`
Adds the given subunits (arguments) to the duration.

### <a name="duration-merge"></a> merge `.merge(dur)`
Merge duration with the given duration, adding the number of beats and concatenating the subunit array.

### <a name="duration-clean"></a> clean `.clean()`
Express the duration in the simplest possible way, i.e., with the greatest number of beats and the largest possible subunits.
