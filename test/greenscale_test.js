"use strict";

var expect = require('chai').expect,
    green = require('../lib/filters/greenscale').convert;

var testObj = {
    pixelMap: [
        [{blue: 80, green: 100, red: 120}]]
};

var expected = {
    pixelMap: [
        [{blue: 0, green: 100, red: 0}]
    ]
};

describe('filter: greenscale', function () {
    it('should remove all colors except green', function () {
        green(testObj);
        expect(testObj).to.deep.equal(expected);
    });
});
