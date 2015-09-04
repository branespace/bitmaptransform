"use strict";

var write32 = null;
var write16 = null;
var read16 = null;
var write8 = null;
var endian;
var writeColor32 = {};
var writeColor24 = {};
var writeColor16 = {};

exports.writeColor32 = null;
exports.writeColor24 = null;
exports.writeColor16 = null;
exports.writeColor8 = writeColor8;
exports.writeColorN = writeColorN;

exports.setup = function (byteOps) {
    write32 = byteOps.write32;
    write16 = byteOps.write16;
    read16 = byteOps.read16;
    write8 = byteOps.write8;
    exports.writeColor32 = writeColor32[byteOps.endian];
    exports.writeColor24 = writeColor24[byteOps.endian];
    exports.writeColor16 = writeColor16[byteOps.endian];
    endian = byteOps;
};

writeColor32.LE = function writeColor32(rawBmp, data, offset) {
    offset = writeColor24.LE(rawBmp, data, offset);
    offset = writeColor8(rawBmp, data, offset, 'alpha');
    return offset;
};

writeColor24.LE = function writeColor24(rawBmp, data, offset) {
    offset = writeColor8(rawBmp, data, offset, 'blue');
    offset = writeColor8(rawBmp, data, offset, 'green');
    offset = writeColor8(rawBmp, data, offset, 'red');
    return offset;
};

writeColor16.LE = function writeColor16(rawBmp, data, offset, bitmask) {
    var bitOffset = 0;
    writeColorN(rawBmp, data.blue, offset, bitOffset, bitmask.blue);
    bitOffset += bitmask.blue;
    writeColorN(rawBmp, data.green, offset, bitOffset, bitmask.green);
    bitOffset += bitmask.green;
    writeColorN(rawBmp, data.red, offset, bitOffset, bitmask.red);
    offset += 2;
    return offset;
};

function writeColor8(rawBmp, data, offset, name) {
    write8.call(rawBmp, data[name], offset);
    offset += 1;
    return offset;
}

function writeColorN(rawBmp, data, offset, bitOffset, bits, index) {
    if (bitOffset === 0) {
        write16.call(rawBmp, 0, offset);
    }
    if (!index) {
        data = Math.round(data / 255 * (Math.pow(2, bits) - 1));
    }
    data = data << (16 - bitOffset - bits);
    data = data + read16.call(rawBmp, offset);
    data = Math.round(data);
    write16.call(rawBmp, data, offset);
}

exports.write32Bits = function write32Bytes(raw, data, offset) {
    return write32.call(raw, data, offset);
};

exports.write16Bits = function write16Bytes(raw, data, offset) {
    return write16.call(raw, data, offset);
};

exports.write8Bits = function write8Bytes(raw, data, offset) {
    return write8.call(raw, data, offset);
};