# Sharp11 Chart Module
`require('sharp11').chart`

Contains a [Chart](#chart-object) object, which can be created with [`chart.create()`](#module-create) or [`chart.createSingleton()`](#module-create-singleton).

## <a name="module"></a> Exported Functions
### <a name="module-create"></a> create `.create(sections, content, info)`
Returns a [Chart](#chart-object) object given:
* `sections` - An array of section names specifying the form of the piece, e.g., `['A', 'A', 'B', 'A']`.
* `content` - An object mapping each section name that appears in `sections` to an array of [Chord](chord.md#chord-object)/[Duration](duration.md#duration-object) pairs.  These pairs can be represented either as an array with two elements or an object with `chord` and `duration` keys.
* `info` - An object containing additional information about the chart.  Certain keys in this object are reserved for special purposes, like `title` and `key`.  `info` should contain only JS primitives, not Sharp11 objects.

### <a name="module-create-singleton"></a> createSingleton `.createSingleton(content, info)`
Creates a [Chart](#chart-object) object with a single section called "A".

### <a name="module-is-chart"></a> isChart `.isChart(obj)`
Returns true if a given object is a [Chart](#chart-object) object.

### <a name="module-load"></a> load `.load(obj)`
Loads a [Chart](#chart-object) object that has been serialized with [chart.serialize()](#chart-serialize).

### <a name="module-export"></a> export `.export(chart, filename)`
Serializes and exports a given [Chart](#chart-object) object to a given filename.

### <a name="module-import"></a> import `.import(filename)`
Loads a [Chart](#chart-object) object that has been exported to a given filename.


## <a name="chart-object"></a> Chart Object
The `Chart` object represents a chord chart, specified by an ordered list of sections and lists of [Chord](chord.md#chord-object)/[Duration](duration.md#duration-object) pairs corresponding to those sections.  The `Chart` constructor is accessible directly as `.Chart`, however new instances should be created using [`.create()`](#module-create) or [`.createSingleton()`](#module-create-singleton) instead.

### <a name="chart-sections"></a> sections `.sections`
An array of section names specifying the form of the piece, e.g., `['A', 'A', 'B', 'A']`.

### <a name="chart-content"></a> content `.content`
An object mapping each section name that appears in `.sections` to an array of [Chord](chord.md#chord-object)/[Duration](duration.md#duration-object) pairs expressed as objects with `chord` and `duration` keys.

### <a name="chart-info"></a> info `.info`
An object containing additional information about the chart.  Certain keys in this object are reserved for special purposes, like `title` and `key`.

### <a name="chart-title"></a> title `.title()`
The title of the chart, if stored in `.info.title`, or "Untitled" otherwise.

### <a name="chart-key"></a> key `.key()`
A [Note](note.md#note-object) object representing the key of the chart, if stored in `.info.key`, or `C` otherwise.

### <a name="chart-serialize"></a> serialize `.serialize()`
Returns a plain JSON version of the chart that can be loaded with [`chart.load()`](#module-load).

### <a name="chart-midi"></a> midi `.midi(settings)`
Returns a [Midi](midi.md#midi-object) object for the chart with given [`settings`](midi.md#midi-settings).

### <a name="chart-chart"></a> chart `.chart(sections)`
Given an optional array of section names, concatenate [Chord](chord.md#chord-object)/[Duration](duration.md#duration-object) arrays for all those sections in order.  `sections` defaults to [`.sections`](#chart-sections), in which case this function returns a [Chord](chord.md#chord-object)/[Duration](duration.md#duration-object) array representing the song in its entirety.

### <a name="chart-chart-with-wrap-around"></a> chartWithWrapAround `.chartWithWrapAround(sections)`
Returns [`.chart(sections)`](#chart-chart) with the first [Chord](chord.md#chord-object)/[Duration](duration.md#duration-object) appended to the end of the array.

### <a name="chart-chord-list"></a> chordList `.chordList(sections)`
Returns [`.chart(sections)`](#chart-chart) but as an array of just [Chord](chord.md#chord-object) objects instead of an array of [Chord](chord.md#chord-object)/[Duration](duration.md#duration-object) objects.

### <a name="chart-chord-list-with-wrap-around"></a> chordListWithWrapAround `.chordListWithWrapAround(sections)`
Returns [`.chart(sections)`](#chart-chart) but as an array of just [Chord](chord.md#chord-object) objects instead of an array of [Chord](chord.md#chord-object)/[Duration](duration.md#duration-object) objects, and with the first chord appended to the end of the array.

### <a name="chart-mehegan-list"></a> meheganList `.meheganList(sections)`
Returns [`.chart(sections)`](#chart-chart) but as an array of [Mehegan](mehegan.md#mehegan-object) symbols instead of an array of [Chord](chord.md#chord-object)/[Duration](duration.md#duration-object) objects.

### <a name="chart-mehegan-list-with-wrap-around"></a> meheganListWithWrapAround `.meheganListWithWrapAround(sections)`
Returns [`.chart(sections)`](#chart-chart) but as an array of [Mehegan](mehegan.md#mehegan-object) symbols instead of an array of [Chord](chord.md#chord-object)/[Duration](duration.md#duration-object) objects, and with the first [Mehegan](mehegan.md#mehegan-object) symbol appended to the end of the array.

### <a name="chart-section-chord-lists"></a> sectionChordLists `.sectionChordLists()`
Returns a map from each section name to an array of [Chord](chord.md#chord-object) objects in that section.

### <a name="chart-section-mehegan-lists"></a> sectionMeheganLists `.sectionMeheganLists()`
Returns a map from each section name to an array of [Mehegan](mehegan.md#mehegan-object) symbols in that section.

### <a name="chart-section-chord-lists-with-wrap-around"></a> sectionChordListsWithWrapAround `.sectionChordListsWithWrapAround()`
Returns a map from each section name to an array of [Chord](chord.md#chord-object) objects in that section.  Appended to the end of each array is the first chord of the next section. i.e., the section that comes after the first appearance of each particular section.

### <a name="chart-section-mehegan-lists-with-wrap-around"></a> sectionMeheganListsWithWrapAround `.sectionMeheganListsWithWrapAround()`
Returns a map from each section name to an array of [Mehegan](mehegan.md#mehegan-object) symbols in that section.  Appended to the end of each array is the first chord of the next section. i.e., the section that comes after the first appearance of each particular section.
