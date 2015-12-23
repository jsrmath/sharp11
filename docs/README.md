# Sharp11 Docs

Sharp11 is divided into the following modules, which can be accessed through `require('sharp11').moduleName`.  Most modules contain an object prototype of the same name that can be created by calling the module's `create()` function.

* [note](note.md)
* [chord](chord.md)
* [scale](scale.md)
* [improv](improv.md)
* midi

### <a name="interval"></a> Intervals
Sharp11 uses `Interval` objects internally to represent intervals.  Intervals have the following properties:

* `number` (e.g. 5)
* `quality` (e.g. "P")
* `name` (e.g. "P5")
* `fullName` (e.g. "Perfect Fifth")

Calling `.toString()` returns the `name` property.  Sharp11 supports interval numbers up to 14.  If a quality is omitted, the interval is assumed to be major or perfect.

### <a name="note-duration"></a> Note Durations
Note durations throughout Sharp11 are represented by objects containing one or both of the following properties:

* `beats`: A number of beats
* `type`: A string or an array of strings that can be one of `sixteenth`, `eighth`, `longEighth`, `shortEighth` (long and short eighths refer to swung eighths)

All these values are added together, so `{beats: 2, type: ['eighth', 'sixteenth']}` yields a half note tied to a dotted eighth.