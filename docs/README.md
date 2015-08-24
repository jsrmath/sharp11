# Sharp11 Docs

Sharp11 is divided into the following modules, which can be accessed through `require('sharp11').moduleName`.  Most modules contain an object prototype of the same name that can be created by calling the module's `create()` function.

* [note](note.md)
* [chord](chord.md)
* scale
* improv
* midi

### <a name="note-duration"></a> Note Durations
Note durations throughout Sharp11 are represented by objects containing one or both of the following properties:

* `beats`: A number of beats
* `type`: A string or an array of strings that can be one of `sixteenth`, `eighth`, `longEighth`, `shortEighth` (long and short eighths refer to swung eighths)

All these values are added together, so `{beats: 2, type: ['eighth', 'sixteenth']}` yields a half note tied to a dotted eighth.