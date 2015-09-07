"use strict";

var expect = require('chai').expect,
    flip = require('../lib/filters/flipvert').convert;

var testObj = {
    pixelMap: [
        ['ul', 'ur'],
        ['ll', 'lr']
    ]
};

var expected = {
    pixelMap: [
        ['ll', 'lr'],
        ['ul', 'ur']
    ]
};

describe('filter: vertical flip', function () {
    it('should reverse order of outer array', function () {
        flip(testObj);
        expect(testObj).to.deep.equal(expected);
    });
});
