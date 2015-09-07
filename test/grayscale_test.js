"use strict";

var expect = require('chai').expect,
    gray = require('../lib/filters/grayscale').convert;

var testObj = {
    pixelMap: [
        [{blue: 80, green: 100, red: 120}]]
};

var expected = {
    pixelMap: [
        [{blue: 103, green: 103, red: 103}]
    ]
};

describe('filter: sepia', function () {
    it('should luminosity scale all colors', function () {
        gray(testObj);
        expect(testObj).to.deep.equal(expected);
    });
});
