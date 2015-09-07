"use strict";

var read32,
    read16,
    read8,
    colors;

//Export all read functions
exports.storeColor32 = storeColor32;
exports.storeColor24 = storeColor24;
exports.storeColor16 = storeColor16;
exports.storeColor8 = storeColor8;
exports.storeColorN = storeColorN;
exports.read32Bits = read32Bits;
exports.read16Bits = read16Bits;
exports.read8Bits = read8Bits;

//Select proper Endian functions
exports.setup = function (byteOps) {
    read32 = byteOps.read32;
    read16 = byteOps.read16;
    read8 = byteOps.read8;
    colors = byteOps.colors;
};

//Puts a 32bit color in object
function storeColor32(conf) {
    var colorIndex = colors.indexOf('alpha');
    if ((conf.bits === 32 && colorIndex === 0) ||
        (conf.bits !== 32 && colorIndex === 1)) {
        conf.name = 'alpha';
        conf.offset = storeColor8(conf);
    }
    colors.splice(colorIndex, 1);
    conf.offset = storeColor24(conf);
    colors.splice(colorIndex, 0, 'alpha');
    if ((conf.bits !== 32 && colorIndex === 0) ||
        (conf.bits === 32 && colorIndex === 1)) {
        conf.name = 'alpha';
        conf.offset = storeColor8(conf);
    }
    return conf.offset;
}

//Puts a 24 bit color pixel in object
function storeColor24(conf) {
    var colorIndex = colors.indexOf('alpha');
    if (colorIndex !== -1) {
        colors.splice(colorIndex, 1);
    }
    for (var i = 0; i < colors.length; i++) {
        conf.name = colors[i];
        conf.offset = storeColor8(conf);
    }
    return conf.offset;
}

//Puts a 16 bit color pixel in object
function storeColor16(conf) {
    conf.data = read16.call(conf.raw, conf.offset);

    return storeMaskedColor(conf);
}

//Store a masked color in the object
function storeMaskedColor(conf) {
    var i,
        temp;
    if (!conf.modColors && colors.indexOf('alpha') === 0) {
        colors.shift();
        conf.modColors = true;
    } else if (!conf.modColors && colors.indexOf('alpha') === 3) {
        colors.pop();
        conf.modColors = true;
    }
    conf.bitOffset = 0;

    for (i = 0; i < colors.length; i++) {
        readColorBits(conf, colors[i]);
    }
    colors.reverse();
    for (i = 0; i < colors.length; i++) {
        alignColorBits(conf, colors[i]);
    }
    colors.reverse();
    for (i = 0; i < colors.length; i++) {
        normalizeColorBits(conf, colors[i]);
    }

    return conf.offset + conf.bits / 8;
}

//Reads the specified bits out of a string
function readColorBits(conf, name) {
    /*jshint bitwise: false*/
    if (conf.bitmask[name] !== 0) {
        conf.bitOffset += conf.bitmask[name];
        conf.loc[name] = conf.data & ((Math.pow(2, conf.bitmask[name]) - 1)
            << (16 - conf.bitOffset));
    }
    /*jshint bitwise: true*/
}

//Aligns bits to mask offset
function alignColorBits(conf, name) {
    /*jshint bitwise: false*/
    if (conf.bitmask[name] !== 0) {
        conf.loc[name] = conf.loc[name] >> (conf.bits - conf.bitOffset);
        conf.bitOffset -= conf.bitmask[name];
    }
    /*jshint bitwise: true*/
}

//Normalizes bit values to one byte
function normalizeColorBits(conf, name) {
    /*jshint bitwise: false*/
    if (conf.bitmask[name] !== 0) {
        conf.loc[name] = Math.floor(conf.loc[name] /
            (Math.pow(2, conf.bitmask[name]) - 1) * 255);
    }
    /*jshint bitwise: true*/
}

//Puts an 8 bit color pixel in object
function storeColor8(conf) {
    conf.loc[conf.name] = read8.call(conf.raw, conf.offset);
    conf.offset += 1;
    return conf.offset;
}

//Reads N bits per color mask and store in object
function storeColorN(conf) {
    var pixels = read16.call(conf.raw, conf.offset);
    conf.name = conf.name || 'index';
    /*jshint bitwise: false*/
    pixels = pixels & (Math.pow(2, conf.bits) - 1);
    /*jslint bitwise: true*/
    conf.loc[conf.name] = pixels;
}

//Reads 32 bits
function read32Bits(raw, offset) {
    return read32.call(raw, offset);
}

function read24Bits(raw, offset) {
    /*jshint bitwise: false*/
    return read32.call(raw, offset) & (Math.pow(2, 24) - 1);
    /*jshint bitwise: true*/
}

//Read 16 bits
function read16Bits(raw, offset) {
    return read16.call(raw, offset);
}

//Read 8 bits
function read8Bits(raw, offset) {
    return read8.call(raw, offset);
}