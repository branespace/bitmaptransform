"use strict";

var write32 = null;
var write16 = null;
var read16 = null;
var write8 = null;
var endian;
var writeColor32 = {};
var writeColor24 = {};
var writeColor16 = {};
var bitBuffer16 = 0, bitBufferCounter =0;

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

writeColor32.LE = function writeColor32(rawBmp, data, offset, name, bits) {
    if(bits === 32){
        offset = writeColor8(rawBmp, data, offset, 'alpha');
    }
    offset = writeColor24.LE(rawBmp, data, offset);
    if(bits !== 32){
        offset = writeColor8(rawBmp, data, offset, 'alpha');
    }
    return offset;
};

writeColor24.LE = function writeColor24(rawBmp, data, offset) {
    offset = writeColor8(rawBmp, data, offset, 'blue');
    offset = writeColor8(rawBmp, data, offset, 'green');
    offset = writeColor8(rawBmp, data, offset, 'red');
    return offset;
};

writeColor16.LE = function writeColor16(rawBmp, data, offset, bitmask) {
    writeColorN(rawBmp, data.blue >> (8 - bitmask.blue), offset, bitmask.blue);
    writeColorN(rawBmp, data.green >> (8 - bitmask.green), offset, bitmask.green);
    writeColorN(rawBmp, data.red >> (8 - bitmask.red), offset, bitmask.red);
    offset += 2;
    return offset;
};

function writeColor8(rawBmp, data, offset, name) {
    write8.call(rawBmp, data[name], offset);
    offset += 1;
    return offset;
}

function writeColorN(rawBmp, data, offset, bits) {
    bitBuffer16 = bitBuffer16 << bits;
    bitBuffer16 |= data;
    bitBufferCounter += bits;
    if(bitBufferCounter === 16){
        write16.call(rawBmp, bitBuffer16, offset);
        bitBufferCounter = 0;
        bitBuffer16 = 0;
    }
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