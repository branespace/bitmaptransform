"use strict";

var expect = require('chai').expect,
    blue = require('../lib/filters/bluescale').convert;

var testObj = {
    pixelMap: [
        [{blue: 80, green: 100, red: 120}]]
};

var expected = {
    pixelMap: [
        [{blue: 80, green: 0, red: 0}]
    ]
};

describe('filter: bluescale', function () {
    it('should remove all colors except blue', function () {
        blue(testObj);
        expect(testObj).to.deep.equal(expected);
    });
});
