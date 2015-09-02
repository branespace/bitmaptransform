"use strict";

var writePixel;

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
var DIBBitmapCoreHeader = require('./spec/dib_BITMAPCOREHEADER');

exports.JSONtoBmp = function (bmpData) {
    var rawBmp = new Buffer(bmpData.fileSize);

    specToBuffer(headerSpec, rawBmp, bmpData);

    if (bmpData.dibtype === 'DIBBITMAPINFOHEADER') {
        specToBuffer(DIBBitmapInfoHeader, rawBmp, bmpData);
    }

    if(bmpData.bitsPerPixel === 8){
        writePixel = writePixel32;
        writePalette(rawBmp, bmpData);
        writePixel = writePixel8;
        flattenPixelMap(rawBmp, bmpData);
    } else if (bmpData.bitsPerPixel === 24) {
        writePixel = writePixel24;
        flattenPixelMap(rawBmp, bmpData);
    }
    return rawBmp;
};

function specToBuffer(spec, rawBmp, bmpData) {
    var i,
        numFields,
        string,
        offset;

    for (i = 0, numFields = spec.length; i < numFields; i += 1) {
        string = bmpData[spec[i].name];
        offset = spec[i].offset;
        if (spec[i].size === 2) {
            rawBmp.writeUInt16LE(string, offset);
        } else if (spec[i].size === 4) {
            rawBmp.writeUInt32LE(string, offset);
        }
    }
}

function flattenPixelMap(rawBmp, bmpData) {
    var i,
        height,
        j,
        width,
        rowPadding,
        offset;

    rowPadding = bmpData.rowPadding;
    offset = bmpData.pixelMapOffset;

    for (i = 0, height = bmpData.height; i < height; i += 1) {
        for (j = 0, width = bmpData.width; j < width; j += 1) {
            offset = writePixel(rawBmp, bmpData.pixelMap[i][j], offset);
        }
        for(j = 0; j < rowPadding; j += 1){
            rawBmp.writeUInt8(0, offset);
            offset += 1;
        }
    }
}

function writePalette(rawBmp, bmpData) {
    var i,
        numColors,
        offset;

    offset = bmpData.dibSize + 14;

    for (i = 0, numColors = bmpData.numPaletteColors; i < numColors; i += 1) {
        offset = writePixel(rawBmp, bmpData.colorPalette[i], offset);
    }
}

function writePixel24(rawBmp, object, offset){
    rawBmp.writeUInt8(object.blue, offset);
    offset += 1;
    rawBmp.writeUInt8(object.green, offset);
    offset += 1;
    rawBmp.writeUInt8(object.red, offset);
    offset += 1;
    return offset;
}

function writePixel32(rawBmp, object, offset){
    rawBmp.writeUInt8(object.blue, offset);
    offset += 1;
    rawBmp.writeUInt8(object.green, offset);
    offset += 1;
    rawBmp.writeUInt8(object.red, offset);
    offset += 1;
    rawBmp.writeUInt8(object.alpha, offset);
    offset += 1;
    return offset;
}
function writePixel8(rawBmp, object, offset){
    rawBmp.writeUInt8(object.index, offset);
    offset += 1;
    return offset;
}
