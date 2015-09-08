"use strict";

var expect = require('chai').expect,
    invert = require('../lib/filters/invert').convert;

var testObj = {
    pixelMap: [
        [{blue: 80, green: 100, red: 120}]]
};

var expected = {
    pixelMap: [
        [{blue: 255- 80, green: 255 - 100, red: 255- 120}]
    ]
};

describe('filter: invert', function () {
    it('should invert all colors', function () {
        invert(testObj);
        expect(testObj).to.deep.equal(expected);
    });
});
