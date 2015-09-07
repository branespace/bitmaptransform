"use strict";

var expect = require('chai').expect,
    red = require('../lib/filters/redscale').convert;

var testObj = {
    pixelMap: [
        [{blue: 80, green: 100, red: 120}]]
};

var expected = {
    pixelMap: [
        [{blue: 0, green: 0, red: 120}]
    ]
};

describe('filter: redscale', function () {
    it('should remove all colors except red', function () {
        red(testObj);
        expect(testObj).to.deep.equal(expected);
    });
});
