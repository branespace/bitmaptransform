"use strict";

var extract = require('../lib/bitmask_extract_bits').extractBits;
var expect = require('chai').expect;

describe('bitmask tests', function() {
   it('should return the correct number of bits', function(){
        expect(extract(254)).to.be.equal(7);
   });
});

