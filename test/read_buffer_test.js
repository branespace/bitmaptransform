"use strict";

var expect = require('chai').expect;
var readBuffer = require(__dirname + '/../lib/read_Buffer');
var littleEndian = {
    read32: Buffer.prototype.readUInt32LE,
    read16: Buffer.prototype.readUInt16LE,
    read8: Buffer.prototype.readUInt8,
    colors: ['blue', 'green', 'red', 'alpha'],
    endian: 'LE'
};
var bigEndian = {
    read32: Buffer.prototype.readUInt32BE,
    read16: Buffer.prototype.readUInt16BE,
    read8: Buffer.prototype.readUInt8,
    endian: 'BE',
    colors: littleEndian.colors
};
var conf = {};

describe('read_buffer_little_endian', function () {
    before(function () {
        readBuffer.setup(littleEndian);

    });
    it('should read 32 bytes in little endian', function () {
        var buf = new Buffer(4);
        conf.raw = buf;
        conf.offset = 0;
        conf.bits = 32;
        var actual = {};
        conf.loc = actual;
        buf.writeUInt32LE(3039516330);
        readBuffer.storeColor32(conf);
        expect(actual.blue).to.equal(buf.readUInt8(0));
    });
});
describe('read_buffer_big_endian', function(){
    before(function () {
        readBuffer.setup(bigEndian);
    });
    it('should read 32 bytes in big endian', function () {
        var buf = new Buffer(4);
        conf.raw = buf;
        conf.offset = 0;
        conf.bits = 32;
        var actual = {};
        conf.loc = actual;
        buf.writeUInt32BE(3039516330);
        readBuffer.storeColor32(conf);
        expect(actual.blue).to.equal(buf.readUInt8(0));
    });

});