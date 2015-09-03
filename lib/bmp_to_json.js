"use strict";

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
var DIBBitmapCoreHeader = require('./spec/dib_BITMAPCOREHEADER');
var readBuffer = require('./read_Buffer');

exports.bmpToJSON = function (rawBmp, byteOperations) {
    var bmpData = {};

    bmpData.raw = rawBmp;

    readBuffer.setup(byteOperations);

    bufferToSpec(headerSpec, bmpData, rawBmp);

    if (bmpData.dibSize === 40) {
        //28 in hex is 40 bytes, thus DIBBITMAPINFOHEADER
        bufferToSpec(DIBBitmapInfoHeader, bmpData, rawBmp);
        bmpData.spec = DIBBitmapInfoHeader;
    } else if (bmpData.dibSize === 12) {
        //C in hex is 12 bytes, this DIBBITMAPCOREHEADER
        bufferToSpec(DIBBitmapCoreHeader, bmpData, rawBmp);
        bmpData.spec = DIBBitmapCoreHeader;
    } else {
        throw new Error('unsupported format');
    }
    //calculate row size and padding

    bmpData.rowSize = 4 * Math.floor((bmpData.bitsPerPixel * bmpData.width + 31) / 32);
    bmpData.rowPadding = bmpData.rowSize - ((bmpData.bitsPerPixel * bmpData.width) / 8);

    if(bmpData.bitsPerPixel === 24) {
        bufferToPixelMap(bmpData, rawBmp, readBuffer.storeColor24);
    } else if (bmpData.bitsPerPixel === 8) {
        readPalette(bmpData, rawBmp, readBuffer.storeColor32);
        bufferToPixelMap(bmpData, rawBmp, readBuffer.storeColor8);
    }

    return bmpData;
};

function bufferToSpec(spec, object, data) {
    var i,
        numFields,
        chunk,
        chunkOffset;

    for (i = 0, numFields = spec.length; i < numFields; i += 1) {
        chunkOffset = spec[i].offset;
        if (spec[i].size === 4) {
            chunk = readBuffer.read32Bits(data, chunkOffset);
        } else if (spec[i].size === 2) {
            chunk = readBuffer.read16Bits(data, chunkOffset);
        }
        object[spec[i].name] = chunk;
    }
}

function bufferToPixelMap(bmpData, rawBmp, storeColor) {
    var i,
        width,
        j,
        height,
        offset,
        rowPadding;

    rowPadding = bmpData.rowPadding;
    offset = bmpData.pixelMapOffset;
    bmpData.pixelMap = [];

    for (i = 0, height = bmpData.height; i < height; i += 1) {
        bmpData.pixelMap[i] = [];
        for (j = 0, width = bmpData.width; j < width; j += 1) {
            bmpData.pixelMap[i][j] = {};
            offset = storeColor(rawBmp, bmpData.pixelMap[i][j], offset, 'index');
        }
        offset += rowPadding;
    }
}

function readPalette(bmpData, rawBmp, storeColor){
    var i,
        offset,
        numColors,
        color;

    bmpData.colorPalette = [];
    offset = 14 + bmpData.dibSize;
    for (i = 0, numColors = bmpData.numPaletteColors; i < numColors; i += 1){
        color = {};
        offset = storeColor(rawBmp, color, offset);
        bmpData.colorPalette.push(color);
    }
}