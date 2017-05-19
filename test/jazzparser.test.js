// TODO: Make these tests more comprehensive

var parser = require('../lib/jazzparser');
var assert = require('assert');

var sample = '!!!OTL: My Funny Valentine\n' + 
'!!!COM: Rodgers, Richard\n' + 
'!!!ODT: 1937\n' + 
'**jazz\n' + 
'*>[A,A2,B,C]\n' + 
'*>A\n' + 
'*M4/4\n' + 
'*E-:\n' + 
'1C:min6\n' + 
'=\n' + 
'2Dh7(C:min:maj7/B)\n' + 
'2G7b9\n' + 
'=\n' + 
'1C:min7(C:min7/B-)\n' + 
'=\n' + 
'1F7(C:min6/A)\n' + 
'=\n' + 
'1A-:maj7\n' + 
'=\n' + 
'1F:min7\n' + 
'=\n' + 
'1Dh7\n' + 
'=\n' + 
'1G7b9\n' + 
'=\n' + 
'*>A2\n' + 
'1C:min6\n' + 
'=\n' + 
'2Dh7(C:min:maj7/B)\n' + 
'2G7b9\n' + 
'=\n' + 
'1C:min7(C:min7/B-)\n' + 
'=\n' + 
'1F7(C:min6/A)\n' + 
'=\n' + 
'1A-:maj7\n' + 
'=\n' + 
'1F:min7\n' + 
'=\n' + 
'1Fh7(B7)\n' + 
'=\n' + 
'1B-7\n' + 
'=\n' + 
'*>B\n' + 
'2E-:maj7\n' + 
'2F:min7\n' + 
'=\n' + 
'2G:min7\n' + 
'2F:min7\n' + 
'=\n' + 
'2E-:maj7\n' + 
'2F:min7\n' + 
'=\n' + 
'2G:min7\n' + 
'2F:min7\n' + 
'=\n' + 
'2E-:maj7\n' + 
'2G7b9\n' + 
'=\n' + 
'4C:min7\n' + 
'4B7\n' + 
'4B-:min7\n' + 
'4A7\n' + 
'=\n' + 
'1A-:maj7\n' + 
'=\n' + 
'2Dh7\n' + 
'2G7b9\n' + 
'=\n' + 
'*>C\n' + 
'1C:min6\n' + 
'=\n' + 
'2Dh7(C:min:maj7/B)\n' + 
'2G7b9\n' + 
'=\n' + 
'1C:min7(C:min7/B-)\n' + 
'=\n' + 
'1F7(C:min6/A)\n' + 
'=\n' + 
'1A-:maj7\n' + 
'=\n' + 
'2Dh7\n' + 
'2G7b9\n' + 
'=\n' + 
'2C:min7\n' + 
'2B7\n' + 
'=\n' + 
'2B-:min7\n' + 
'2E-7\n' + 
'=\n' + 
'1A-:maj7\n' + 
'=\n' + 
'2F:min7\n' + 
'2B-7\n' + 
'=\n' + 
'1E-6\n' + 
'=\n' + 
'2Dh7\n' + 
'2G7b9\n' + 
'==\n' + 
'*-\n' + 
'!!!EEV: iRb Corpus 1.0\n' + 
'!!!YER: 26 Dec 2012\n' + 
'!!!EED: Daniel Shanahan and Yuri Broze\n' + 
'!!!ENC: Yuri Broze\n' + 
'!!!AGN: Jazz Lead Sheets\n' + 
'!!!PPP: http://irealb.com/forums/showthread.php?1580-Jazz-1200-standards';

describe('Jazz Parser', function () {
  var chart = parser.parseString(sample);

  it('should parse section names', function () {
    assert.equal(chart.sections.toString(), 'A,A2,B,C');
  });

  it('should parse song information', function () {
    assert.equal(chart.info.title, 'My Funny Valentine');
    assert.equal(chart.info.composer, 'Rodgers, Richard');
    assert.equal(chart.info.date, '1937');

    assert.equal(chart.info.key.toString(), 'Eb');
    assert.equal(chart.info.minor, false);
    assert.equal(chart.info.time.toString(), '4,4');
  });

  it('should parse sections accurately', function () {
    assert.equal(chart.content.A[0].chord.name, 'Cmin6');
    assert.equal(chart.content.A[0].duration.value(), 4);
    assert.equal(chart.content.A[1].chord.name, 'Dø7');
    assert.equal(chart.content.A[1].duration.value(), 2);
  });
});
