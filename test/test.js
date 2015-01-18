var assert = require('assert'),
    discoverable = require('../src/index.js');

// Unit tests will come soon !!!!!

describe('Discoverable node',function(){

  it('Should match arrays that have partial match', function() {

    var result = discoverable._match(['test1', 'test2'], ['test3', 'test4']);
    assert.ok( !result );

    var result = discoverable._match(['test1', 'test2'], ['test2', 'test3', 'test4']);
    assert.ok( result );

    var result = discoverable._match(['test1', 'test2', 'test4'], ['test2', 'test3', 'test4']);
    assert.ok( result );
  });

});