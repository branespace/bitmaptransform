"use strict";

var read32 = null;
var read16 = null;
var read8 = null;

//Export all read functions
exports.storeColor32 = storeColor32;
exports.storeColor24 = storeColor24;
exports.storeColor16 = storeColor16;
exports.storeColor8 = storeColor8;
exports.storeColorN = storeColorN;
exports.read32Bits = read32Bits;
exports.read16Bits = read16Bits;
exports.read8Bits = read8Bits;

//Select proper endian functions
exports.setup = function (byteOps) {
    read32 = byteOps.read32;
    read16 = byteOps.read16;
    read8 = byteOps.read8;
};

//Puts a 32bit color in object
function storeColor32(rawBmp, loc, offset, name, bits) {
    if (bits === 32) {
        offset = storeColor8(rawBmp, loc, offset, 'alpha');
    }
    offset = storeColor24(rawBmp, loc, offset);
    if (bits !== 32) {
        offset = storeColor8(rawBmp, loc, offset, 'alpha');
    }
    return offset;
}

//Puts a 24 bit color pixel in object
function storeColor24(rawBmp, loc, offset) {
    offset = storeColor8(rawBmp, loc, offset, 'blue');
    offset = storeColor8(rawBmp, loc, offset, 'green');
    offset = storeColor8(rawBmp, loc, offset, 'red');
    return offset;
}

//Puts a 16 bit color pixel in object
function storeColor16(rawBmp, loc, offset, bitmask) {
    var bitOffset = 0;
    var pixels = read16.call(rawBmp, offset);

    bitOffset = bitmask.blue;

    /*jshint bitwise: false*/
    loc.blue = pixels & ((Math.pow(2, bitmask.blue) - 1) << (16 - bitOffset));
    bitOffset += bitmask.green;
    loc.green = pixels & ((Math.pow(2, bitmask.green) - 1) << (16 - bitOffset));
    bitOffset += bitmask.red;
    loc.red = pixels & ((Math.pow(2, bitmask.red) - 1) << (16 - bitOffset));

    loc.red = loc.red >> (16 - bitOffset);
    bitOffset -= bitmask.red;
    loc.green = loc.green >> (16 - bitOffset);
    bitOffset -= bitmask.green;
    loc.blue = loc.blue >> (16 - bitOffset);
    /*jshint bitwise: true*/

    loc.blue = Math.floor(loc.blue / (Math.pow(2, bitmask.blue) - 1) * 255);
    loc.green = Math.floor(loc.green / (Math.pow(2, bitmask.green) - 1) * 255);
    loc.red = Math.floor(loc.red / (Math.pow(2, bitmask.red) - 1) * 255);

    return offset + 2;
}

//Puts an 8 bit color pixel in object
function storeColor8(rawBmp, loc, offset, name) {
    loc[name] = read8.call(rawBmp, offset);
    offset += 1;
    return offset;
}

//Reads N bits per color mask and store in object
function storeColorN(rawBmp, loc, offset, bitOffset, bits, name) {
    var pixels = read16.call(rawBmp, offset);
    name = name || 'index';
    /*jshint bitwise: false*/
    pixels = pixels & (Math.pow(2, bits) - 1);
    /*jslint bitwise: true*/
    loc[name] = pixels;
}

//Reads 32 bits
function read32Bits(raw, offset) {
    return read32.call(raw, offset);
}

//Read 16 bits
function read16Bits(raw, offset) {
    return read16.call(raw, offset);
}

//Read 8 bits
function read8Bits(raw, offset) {
    return read8.call(raw, offset);
}