"use strict";

var expect = require('chai').expect,
    sepia = require('../lib/filters/sepia').convert;

var testObj = {
    pixelMap: [
        [{blue: 100, green:100, red:100}]]
};

var expected = {
    pixelMap: [
        [{blue:65, green:135, red:170}]
    ]
};

describe('filter: sepia', function () {
    it('should scale colors from baseline', function () {
        sepia(testObj);
        expect(testObj).to.deep.equal(expected);
    });
});
