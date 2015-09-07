"use strict";

var endian = require('../lib/endian_functions');
var expect = require('chai').expect;

describe('endian switch', function () {
    it('should properly select LE on little endian machine', function () {
        expect(endian.write32).to.be.equal(Buffer.prototype.writeUInt32LE);
    });
    it('should read 24 bits', function () {
        var buf = new Buffer('ffffff', 'hex');
        var actual = endian.read24.call(buf, 0);
        expect(actual).to.equal(0xffffff);
    });
    it('should write 24 bits', function () {
        var buf = new Buffer(4);
        endian.write32.call(buf, 0xffffffff, 0);
        var actual = new Buffer(3);
        endian.write24.call(actual, 0xffffff, 0);
        expect(actual[1]).to.equal(buf[1]);
    });
});