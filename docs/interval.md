# Sharp11 Interval Module
`require('sharp11').interval`

Contains an [Interval](#interval-object) object, which can be created with [`interval.create()`](#module-create) or [`interval.parse()`](#module-parse).  Methods of the [Interval](#interval-object) object do not mutate it, they return a new object.

## <a name="module"></a> Exported Functions
### <a name="module-create"></a> create `.create(number, quality)`
Returns an [Interval](#interval-object) object given a number (1-13) and a quality, e.g. "M" or "maj".

### <a name="module-parse"></a> parse `.parse(str)`
Returns an [Interval](#interval-object) object given a string representing that interval, e.g. "P5".

### <a name="module-is-perfect"></a> isPerfect `.isPerfect(num)`
Returns true if a given number represents that of a perfect interval (1, 4, 5, 8, 11, 12).

## <a name="interval-object"></a> Interval Object
The `Interval` object represents an interval between two notes up to a thirteenth.  These objects are used quite often internally, but rarely need to be created directly, since every Sharp11 function that takes an interval can be passed a string instead.  If necessary, `Interval` objects can be created using [`.create()`](#module-create) or [`.parse()`](#module-parse).  The `Interval` constructor is also accessible directly as `.Interval`.

### <a name="interval-number"></a> number `.number`
The number of the interval, e.g., 5.

### <a name="interval-quality"></a> quality `.quality`
The quality of the interval, e.g., "P".

### <a name="interval-name"></a> name `.name`
The name of the interval, e.g., "P5".

### <a name="interval-full-name"></a> fullName `.fullName`
The full name of the interval, e.g., "Perfect Fifth".

### <a name="interval-invert"></a> invert `.invert()`
Returns the equivalent interval in the opposite direction, e.g., m3 -> M6.

### <a name="interval-half-steps"></a> halfSteps `.halfSteps()`
Returns the number of half steps in the interval, e.g., P5 -> 7.