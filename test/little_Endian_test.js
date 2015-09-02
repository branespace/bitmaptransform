"use strict";

var expect = require('chai').expect;
var littleEndian = require('../lib/little_Endian');

describe('little endian rotation', function () {
    it('should return a reversed buffer', function () {
        var buf = new Buffer([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        var result = littleEndian(buf);
        expect(result.toString('hex', 0, result.length)).to.
            equal("0a090807060504030201");
    });
});