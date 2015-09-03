"use strict";

var read32 = null;
var read16 = null;
var read8 = null;

exports.storeColor8 = storeColor8;
exports.storeColor24 = storeColor24;
exports.storeColor32 = storeColor32;

exports.setup = function (byteOps) {
    read32 = byteOps.read32;
    read16 = byteOps.read16;
    read8 = byteOps.read8;
};

function storeColor32(loc, rawBmp, offset) {
    offset = storeColor8(loc, rawBmp, offset, 'alpha');
    offset = storeColor24(loc, rawBmp, offset);
    return offset;
}

function storeColor24(loc, rawBmp, offset) {
    offset = storeColor8(loc, rawBmp, offset, 'blue');
    offset = storeColor8(loc, rawBmp, offset, 'green');
    offset = storeColor8(loc, rawBmp, offset, 'red');
    return offset;
}

function storeColor8(loc, rawBmp, offset, name) {
    loc[name] = read8.call(rawBmp, offset);
    offset += 1;
    return offset;
}

exports.read32Bits = function read32Bytes(raw, offset){
    return read32.call(raw, offset);
};

exports.read16Bits = function read16Bytes(raw, offset){
    return read16.call(raw, offset);
};

exports.read8Bits = function read8Bytes(raw, offset){
    return read8.call(raw, offset);
};