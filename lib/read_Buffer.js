"use strict";

var read32 = null;
var read16 = null;
var read8 = null;
var endian;
var storeColor32 = {};
var storeColor24 = {};
var storeColor16 = {};

exports.storeColor32 = null;
exports.storeColor24 = null;
exports.storeColor16 = null;
exports.storeColor8 = storeColor8;
exports.storeColorN = storeColorN;

exports.setup = function (byteOps) {
    read32 = byteOps.read32;
    read16 = byteOps.read16;
    read8 = byteOps.read8;
    exports.storeColor32 = storeColor32[byteOps.endian];
    exports.storeColor24 = storeColor24[byteOps.endian];
    exports.storeColor16 = storeColor16[byteOps.endian];
    endian = byteOps;
};

storeColor32.LE = function storeColor32(rawBmp, loc, offset, name, bits) {
    if(bits === 32){
        offset = storeColor8(rawBmp, loc, offset, 'alpha');
    }
    offset = storeColor24.LE(rawBmp, loc, offset);
    if(bits !== 32) {
        offset = storeColor8(rawBmp, loc, offset, 'alpha');
    }
    return offset;
};

storeColor32.BE = function storeColor32(rawBmp, loc, offset) {
    offset = storeColor8(rawBmp, loc, offset, 'alpha');
    offset = storeColor24.BE(rawBmp, loc, offset);
    return offset;
};

storeColor24.LE = function storeColor24(rawBmp, loc, offset) {
    offset = storeColor8(rawBmp, loc, offset, 'blue');
    offset = storeColor8(rawBmp, loc, offset, 'green');
    offset = storeColor8(rawBmp, loc, offset, 'red');
    return offset;
};

storeColor24.BE = function storeColor24(rawBmp, loc, offset) {
    offset = storeColor8(rawBmp, loc, offset, 'red');
    offset = storeColor8(rawBmp, loc, offset, 'green');
    offset = storeColor8(rawBmp, loc, offset, 'blue');
    return offset;
};

storeColor16.LE = function storeColor16(rawBmp, loc, offset, bitmask) {
    var bitOffset = 0;
    storeColorN(rawBmp, loc, offset, bitOffset, bitmask.blue, 'blue');
    loc.blue = Math.round(loc.blue / (Math.pow(2, bitmask.blue) - 1) * 255);
    bitOffset += bitmask.blue;
    storeColorN(rawBmp, loc, offset, bitOffset, bitmask.green, 'green');
    loc.green = Math.round(loc.green / (Math.pow(2, bitmask.green) - 1) * 255);
    bitOffset += bitmask.green;
    storeColorN(rawBmp, loc, offset, bitOffset, bitmask.red, 'red');
    loc.red = Math.round(loc.red / (Math.pow(2, bitmask.red) - 1) * 255);
    offset += 2;
    return offset;
};

storeColor16.BE = function storeColor16(rawBmp, loc, offset, bitmask) {
    var bitOffset = 0;
    storeColorN(rawBmp, loc, offset, bitOffset, bitmask.red, 'red');
    loc.red = Math.round(loc.red / (Math.pow(2, bitmask.blue) - 1) * 255);
    bitOffset += bitmask.red;
    storeColorN(rawBmp, loc, offset, bitOffset, bitmask.green, 'green');
    loc.green = Math.round(loc.green / (Math.pow(2, bitmask.green) - 1) * 255);
    bitOffset += bitmask.green;
    storeColorN(rawBmp, loc, offset, bitOffset, bitmask.blue, 'blue');
    loc.blue = Math.round(loc.blue / (Math.pow(2, bitmask.blue) - 1) * 255);
    offset += 2;
    return offset;
};

function storeColor8(rawBmp, loc, offset, name) {
    loc[name] = read8.call(rawBmp, offset);
    offset += 1;
    return offset;
}

function storeColorN(rawBmp, loc, offset, bitOffset, bits, name){
    var pixels = read16.call(rawBmp, offset);
    name = name || 'index';
    /*jshint bitwise: false*/
    pixels = pixels >> (-bitOffset + 16 - bits);
    pixels = pixels & (Math.pow(2, bits) - 1);
    /*jslint bitwise: true*/
    loc[name] = pixels;
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