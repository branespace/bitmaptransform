"use strict";

var write32 = null;
var write16 = null;
var write8 = null;

exports.writeColor8 = writeColor8;
exports.writeColor24 = writeColor24;
exports.writeColor32 = writeColor32;

exports.setup = function (byteOps) {
    write32 = byteOps.write32;
    write16 = byteOps.write16;
    write8 = byteOps.write8;
};

function writeColor32(rawBmp, data, offset) {
    offset = writeColor24(rawBmp, data, offset);
    offset = writeColor8(rawBmp, data, offset, 'alpha');
    return offset;
}

function writeColor24(rawBmp, data, offset) {
    offset = writeColor8(rawBmp, data, offset, 'blue');
    offset = writeColor8(rawBmp, data, offset, 'green');
    offset = writeColor8(rawBmp, data, offset, 'red');
    return offset;
}

function writeColor8(rawBmp, data, offset, name) {
    write8.call(rawBmp, data[name], offset);
    offset += 1;
    return offset;
}

exports.write32Bits = function write32Bytes(raw, data, offset){
    return write32.call(raw, data, offset);
};

exports.write16Bits = function write16Bytes(raw, data, offset){
    return write16.call(raw, data, offset);
};

exports.write8Bits = function write8Bytes(raw, data, offset){
    return write8.call(raw, data, offset);
};