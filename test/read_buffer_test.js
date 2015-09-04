"use strict";

var expect = require('chai').expect;
var readBuffer = require('../lib/read_Buffer');
var littleEndian = {
    read32: Buffer.prototype.readUInt32LE,
    read16: Buffer.prototype.readUInt16LE,
    read8: Buffer.prototype.readUInt8,
    endian: 'LE'
};
var bigEndian = {
    read32: Buffer.prototype.readUInt32BE,
    read16: Buffer.prototype.readUInt16BE,
    read8: Buffer.prototype.readUInt8,
    endian: 'BE'
};

describe('read_buffer_little_endian', function () {
    before(function () {
        readBuffer.setup(littleEndian);
    });
    it('should read 32 bytes in little endian', function () {
        var buf = new Buffer([255,128,64,16]);
        var test = {};
        readBuffer.storeColor32(buf, test, 0);
        expect(test.blue).to.equal(255);
    });
    it('should read 16 bytes in little endian', function () {
        var buf = new Buffer([255,128,64]);
        var test = {};
        readBuffer.storeColor16(buf, test, 0);
        expect(test.blue).to.equal(255);
    });
    it('should read 24 bytes in little endian', function () {
        var buf = new Buffer([255,128,64]);
        var test = {};
        readBuffer.storeColor24(buf, test, 0);
        expect(test.blue).to.equal(255);
    });
    it('should read 8 bytes in little endian', function () {
        var buf = new Buffer([255]);
        var test = {};
        readBuffer.storeColor8(buf, test, 0, 'index');
        expect(test.index).to.equal(255);
    });
    it('should read 4 bytes in little endian', function () {
        var buf = new Buffer([255]);
        var test = {};
        readBuffer.storeColor4(buf, test, 0, 4, 'index');
        expect(test.index).to.equal(255);
    });
    it('should read 2 bytes in little endian', function () {
        var buf = new Buffer([255]);
        var test = {};
        readBuffer.storeColor2(buf, test, 0, 6,'index');
        expect(test.index).to.equal(192);
    });
    it('should read 1 bytes in little endian', function () {
        var buf = new Buffer([255]);
        var test = {};
        readBuffer.storeColor1(buf, test, 0, 6,'index');
        expect(test.index).to.equal(128);
    });
});
describe('read_buffer_big_endian', function(){
    before(function () {
        readBuffer.setup(bigEndian);
    });
    it('should read 32 bytes in big endian', function () {
        var buf = new Buffer([16,64,128,255]);
        var test = {};
        readBuffer.storeColor32(buf, test, 0);
        expect(test.blue).to.equal(255);
    });
    it('should read 24 bytes in little endian', function () {
        var buf = new Buffer([64,128,255]);
        var test = {};
        readBuffer.storeColor24(buf, test, 0);
        expect(test.blue).to.equal(255);
    });
    it('should read 16 bytes in big endian', function () {
        var buf = new Buffer([128,255]);
        var test = {};
        readBuffer.storeColor16(buf, test, 0);
        expect(test.blue).to.equal(255);
    });
    it('should read 8 bytes in big endian', function () {
        var buf = new Buffer([255]);
        var test = {};
        readBuffer.storeColor8(buf, test, 0, 'index');
        expect(test.index).to.equal(255);
    });
    it('should read 4 bytes in big endian', function () {
        var buf = new Buffer([255]);
        var test = {};
        readBuffer.storeColor4(buf, test, 0, 4, 'index');
        expect(test.index).to.equal(255);
    });
    it('should read 2 bytes in big endian', function () {
        var buf = new Buffer([255]);
        var test = {};
        readBuffer.storeColor2(buf, test, 0, 6, 'index');
        expect(test.index).to.equal(192);
    });
    it('should read 1 bytes in big endian', function () {
        var buf = new Buffer([255]);
        var test = {};
        readBuffer.storeColor1(buf, test, 0, 6, 'index');
        expect(test.index).to.equal(128);
    });
});