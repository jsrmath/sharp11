# Sharp11 Corpus Module
`require('sharp11').corpus`

Contains a [Corpus](#corpus-object) object, which can be created with [`corpus.create()`](#module-create).

## <a name="module"></a> Exported Functions
### <a name="module-create"></a> create `.create(charts)`
Return a [Corpus](#corpus-object) object given an array of [Chart](#chart-object) objects.

### <a name="module-load"></a> load `.load(obj)`
Loads a [Corpus](#corpus-object) object that has been serialized with [corpus.serialize()](#corpus-serialize).

### <a name="module-export"></a> export `.export(corpus, filename)`
Serializes and exports a given [Corpus](#corpus-object) object to a given filename.

### <a name="module-import"></a> import `.import(filename)`
Loads a [Corpus](#corpus-object) object that has been exported to a given filename.

## <a name="corpus-object"></a> Corpus Object
The `Corpus` object is simply a wrapper for an array of [Chart](#chart-object) objects.  It provides various methods for analyzing a corpus of chord charts.  The `Corpus` constructor is accessible directly as `.Corpus`, however new instances should be created using [`.create()`](#module-create) instead.

### <a name="corpus-charts"></a> charts `.charts`
The array of [Chart](#chart-object) objects in the corpus.

### <a name="corpus-serialize"></a> serialize `.serialize()`
Returns a plain JSON version of the corpus that can be loaded with [`corpus.load()`](#module-load).

### <a name="corpus-find-songs-with-sequence"></a> findSongsWithSequence `.findSongsWithSequence(arr)`
Return an array of charts that contain a given array of [Mehegan](mehegan.md#mehegan-object) symbols in the full form of the chart (with [wrap-around](chart.md#chart-chart-with-wrap-around)).

### <a name="corpus-find-song-titles-with-sequence"></a> findSongTitlesWithSequence `.findSongTitlesWithSequence(arr)`
Return an array of titles of charts that contain a given array of [Mehegan](mehegan.md#mehegan-object) symbols in the full form of the chart (with [wrap-around](chart.md#chart-chart-with-wrap-around)).

### <a name="corpus-count-instances-of-sequence"></a> countInstancesOfSequence `.countInstancesOfSequence(arr)`
Return the number of times a given array of [Mehegan](mehegan.md#mehegan-object) symbols appears in a corpus.  Each appearance of the sequence in the full form of a chart (with [wrap-around](chart.md#chart-chart-with-wrap-around)) is counted separately.

### <a name="corpus-get-n-gram-probability"></a> getNGramProbability `.getNGramProbability(arr)`
Return the probability of a given n-gram (array of [Mehegan](mehegan.md#mehegan-object) symbols) appearing in the corpus.  More specifically, `.getNGramProbability([a,b,c])` corresponds to `P(b,c|a)`.
