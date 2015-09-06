"use strict";

var write = require('../lib/write_buffer');
var expect = require('chai').expect;
var conf = {};
var endian = require('../lib/endian_functions');

describe('buffer writer', function () {
    before(function () {
        endian.setFunctions();
        write.setup(endian);
    });
    it('should write 32 bit values correctly LE', function () {
        var buf = new Buffer(4);
        buf.writeUInt32LE(0x64646400);
        conf = {
            bits: 32,
            raw: new Buffer(4),
            offset: 0,
            data: {
                blue: 100,
                red: 100,
                alpha: 0,
                green: 100
            }
        };
        write.writeColor32(conf);
        expect(conf.raw.toString('hex')).to.be.equal(buf.toString('hex'));
    });
    it('should write 32 bit values correctly BE', function () {
        endian.setFunctions();
        endian.write32 = Buffer.prototype.writeUInt32BE;
        endian.write8 = Buffer.prototype.writeUInt8;
        endian.write32 = Buffer.prototype.writeUInt32BE;
        write.setup(endian);
        var buf = new Buffer(4);
        buf.writeUInt32BE(0x00646464);
        conf = {
            bits: 32,
            raw: new Buffer(4),
            offset: 0,
            data: {
                blue: 100,
                red: 100,
                alpha: 0,
                green: 100
            }
        };
        write.writeColor32(conf);
        expect(conf.raw.toString('hex')).to.be.equal(buf.toString('hex'));
    });
});