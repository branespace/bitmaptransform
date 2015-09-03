"use strict";

var read32 = null;
var read16 = null;
var read8 = null;

exports.storeColor32 = storeColor32;
exports.storeColor24 = storeColor24;
exports.storeColor16 = storeColor16;
exports.storeColor8 = storeColor8;
exports.storeColor4 = storeColor4;
exports.storeColor2 = storeColor2;
exports.storeColor1 = storeColor1;

exports.setup = function (byteOps) {
    read32 = byteOps.read32;
    read16 = byteOps.read16;
    read8 = byteOps.read8;
};

function storeColor32(rawBmp, loc, offset) {
    offset = storeColor24(rawBmp, loc, offset);
    offset = storeColor8(rawBmp, loc, offset, 'alpha');
    return offset;
}

function storeColor24(rawBmp, loc, offset) {
    offset = storeColor8(rawBmp, loc, offset, 'blue');
    offset = storeColor8(rawBmp, loc, offset, 'green');
    offset = storeColor8(rawBmp, loc, offset, 'red');
    return offset;
}

function storeColor16(rawBmp, loc, offset) {
    storeColor4(rawBmp, loc, offset, 0, 'blue');
    storeColor4(rawBmp, loc, offset, 4, 'green');

    offset += 1;

    storeColor4(rawBmp, loc, offset, 0, 'red');
    storeColor4(rawBmp, loc, offset, 4, 'alpha');

    offset += 1;

    return offset;
}

function storeColor8(rawBmp, loc, offset, name) {
    loc[name] = read8.call(rawBmp, offset);
    offset += 1;
    return offset;
}

function storeColor4(rawBmp, loc, offset, bitOffset, name) {

    var pixel = read8.call(rawBmp, offset);
    /*jshint bitwise: false*/
    pixel = pixel >> (-bitOffset + 4);
    pixel = pixel & 15;
    if(name){
        pixel = pixel << (-bitOffset + 4);
    } else {
        name = 'index';
    }
    /*jslint bitwise: true*/
    loc[name] = pixel;
}

function storeColor2(rawBmp, loc, offset, bitOffset) {
    var pixel = read8.call(rawBmp, offset);
    /*jshint bitwise: false*/
    pixel = pixel >> (-bitOffset + 6);
    pixel = pixel & 3;
    pixel = pixel << (-bitOffset + 6);
    /*jslint bitwise: true*/
    loc.index = pixel;
}

function storeColor1(rawBmp, loc, offset, bitOffset) {
    var pixel = read8.call(rawBmp, offset);
    /*jshint bitwise: false*/
    pixel = pixel >> (-bitOffset + 7);
    pixel = pixel & 1;
    pixel = pixel << (-bitOffset + 7);
    /*jslint bitwise: true*/
    loc.index = pixel;
    console.log(pixel);
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