"use strict";

var write32,
    write16,
    write8,
    bitBuffer16 = 0,
    bitBufferCounter = 0,
    colors;

//export writer functions

exports.writeColor32 = writeColor32;
exports.writeColor24 = writeColor24;
exports.writeColor16 = writeColor16;
exports.writeColor8 = writeColor8;
exports.writeColorN = writeColorN;

//Select correct endianness functions
exports.setup = function (byteOps) {
    write32 = byteOps.write32;
    write16 = byteOps.write16;
    write8 = byteOps.write8;
    colors = byteOps.colors;
};

//Write 32 bit color data to buffer
function writeColor32(conf) {
    var colorIndex = colors.indexOf('alpha');

    if ((conf.bits === 32 && colorIndex === 0) ||
        (conf.bits !== 32 && colorIndex === 1)) {
        conf.name = 'alpha';
        conf.offset = writeColor8(conf);
    }
    colors.splice(colorIndex, 1);
    conf.offset = writeColor24(conf);
    conf.name = 'alpha';
    colors.splice(colorIndex, 0, 'alpha');
    if ((conf.bits !== 32 && colorIndex === 0) ||
        (conf.bits === 32 && colorIndex === 1)) {
        conf.name = 'alpha';
        conf.offset = writeColor8(conf);
    }
    return conf.offset;
}

//Write 24 bit color data to buffer
function writeColor24(conf) {
    var i,      //loop index
        colorIndex = colors.indexOf('alpha');

    if (colorIndex !== -1) {
        colors.splice(colorIndex, 1);
    }
    for (i = 0; i < colors.length; i++) {
        conf.name = colors[i];
        conf.offset = writeColor8(conf);
    }

    return conf.offset;
}

//Write 16 bit color data to buffer
function writeColor16(conf) {
    var i;      //loop index

    if (!conf.modColors && colors.indexOf('alpha') === 0) {
        colors.shift();
        conf.modColors = true;
    } else if (!conf.modColors && colors.indexOf('alpha') === 3) {
        colors.pop();
        conf.modColors = true;
    }

    for (i = 0; i < colors.length; i++) {
        if (conf.data.hasOwnProperty(colors[i])) {
            /*jshint bitwise: false*/
            conf.data[colors[i]] = conf.data[colors[i]] >> (8 - conf.bitmask[colors[i]]);
            /*jshint bitwise: true*/
            conf.bitsToWrite = conf.bitmask[colors[i]];
            conf.name = colors[i];
            writeColorN(conf);
        }
    }

    return conf.offset;
}

//Write 8 bit color data or index to buffer
function writeColor8(conf) {
    write8.call(conf.raw, conf.data[conf.name], conf.offset);
    conf.offset += 1;
    return conf.offset;
}

//Write N bits to buffer
function writeColorN(conf) {
    /*jshint bitwise: false*/
    bitBuffer16 = bitBuffer16 << conf.bitsToWrite;
    bitBuffer16 |= conf.data[conf.name];
    /*jshint bitwise: true*/
    bitBufferCounter += conf.bitsToWrite;
    if (bitBufferCounter === 16) {
        write16.call(conf.raw, bitBuffer16, conf.offset);
        bitBufferCounter = 0;
        bitBuffer16 = 0;
        conf.offset += 2;
    }
    return conf.offset;
}

//Write 32 bits to buffer
exports.write32Bits = function write32Bytes(raw, data, offset) {
    return write32.call(raw, data, offset);
};

//Write 16 bits to buffer
exports.write16Bits = function write16Bytes(raw, data, offset) {
    return write16.call(raw, data, offset);
};

//Writes 8 bits to buffer
exports.write8Bits = function write8Bytes(raw, data, offset) {
    return write8.call(raw, data, offset);
};