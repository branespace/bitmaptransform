"use strict";

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
var littleEndian = require('./little_Endian');

exports.bmpToJSON = function (rawBmp) {
    var bmpData = {},
        rowSize,
        rowPadding;

    //BMP Header
    processSpec(headerSpec, bmpData, rawBmp);

    if (bmpData.dibSize === '00000028') {
        //28 in hex is 40 bytes, thus DIBBITMAPINFOHEADER
        processSpec(DIBBitmapInfoHeader, bmpData, rawBmp);
        bmpData.dibtype = 'DIBBITMAPINFOHEADER';
    } else if (bmpData.dibSize === '0000000C') {
        //C in hex is 12 bytes, this DIBBITMAPCOREHEADER
        processSpec(DIBBitmapCoreHeader, bmpData, rawBmp);
        bmpData.dibtype = 'DIBBITMAPCOREHEADER';
    } else {
        throw new Error('unsupported format');
    }

    //calculate row size and padding
    bmpData.rowSize = 4 * Math.floor((bmpData.bitsPerPixel *
            bmpData.width + 31) / 32);
    bmpData.rowPadding = (Math.ceil(bmpData.rowSize / 32.0) * 32) -
        bmpData.rowSize;

    return bmpData;
};

function processSpec(spec, object, data) {
    var i,
        numFields,
        chunk,
        chunkOffset,
        chunkEnd,
        tempBuffer;

    for (i = 0, numFields = spec.length; i < numFields; i += 1) {
        chunkOffset = spec[i].offset;
        chunkEnd = chunkOffset + spec[i].size;
        chunk = data.slice(chunkOffset, chunkEnd);
        tempBuffer = new Buffer(chunk);
        tempBuffer = littleEndian(tempBuffer);
        object[spec[i].name] = tempBuffer.toString('hex', 0, tempBuffer.length);
    }
}