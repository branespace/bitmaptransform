"use strict";

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
var DIBBitmapCoreHeader = require('./spec/dib_BITMAPCOREHEADER');

exports.bmpToJSON = function (rawBmp) {
    var bmpData = {};

    //BMP Header
    specToProperties(headerSpec, bmpData, rawBmp);

    if (bmpData.dibSize === 40) {
        //28 in hex is 40 bytes, thus DIBBITMAPINFOHEADER
        specToProperties(DIBBitmapInfoHeader, bmpData, rawBmp);
        bmpData.dibtype = 'DIBBITMAPINFOHEADER';
        bmpData.bytesPerPixel = 3;
        bmpData.bytesPerColor = 1;
    } else if (bmpData.dibSize === 12) {
        //C in hex is 12 bytes, this DIBBITMAPCOREHEADER
        specToProperties(DIBBitmapCoreHeader, bmpData, rawBmp);
        bmpData.dibtype = 'DIBBITMAPCOREHEADER';
        bmpData.bytesPerPixel = 3;
        bmpData.bytesPerColor = 1;
    } else {
        throw new Error('unsupported format');
    }

    //calculate row size and padding

    bmpData.rowSize = 4 * Math.floor((bmpData.bitsPerPixel * bmpData.width + 31) / 32);
    bmpData.rowPadding = bmpData.rowSize - ((bmpData.bitsPerPixel * bmpData.width) / 8);

    populatePixelArray(bmpData, rawBmp);

    return bmpData;
};

function specToProperties(spec, object, data) {
    var i,
        numFields,
        chunk,
        chunkOffset;

    for (i = 0, numFields = spec.length; i < numFields; i += 1) {
        chunkOffset = spec[i].offset;
        if (spec[i].size === 4) {
            chunk = data.readInt32LE(chunkOffset);
        } else if (spec[i].size === 2) {
            chunk = data.readInt16LE(chunkOffset);
        }
        object[spec[i].name] = chunk;
    }
}

function populatePixelArray(bmpData, rawBmp) {
    var i,
        width,
        j,
        height,
        bytesPerColor,
        offset,
        rowPadding;

    bytesPerColor = bmpData.bytesPerColor;
    rowPadding = bmpData.rowPadding;
    offset = bmpData.pixelMapOffset;
    bmpData.pixelMap = [];
    for (i = 0, height = bmpData.height; i < height; i += 1) {
        bmpData.pixelMap[i] = [];
        for (j = 0, width = bmpData.width; j < width; j += 1) {
            bmpData.pixelMap[i][j] = {};
            bmpData.pixelMap[i][j].blue = rawBmp.readUInt8(offset);
            offset += bytesPerColor;
            bmpData.pixelMap[i][j].green = rawBmp.readUInt8(offset);
            offset += bytesPerColor;
            bmpData.pixelMap[i][j].red = rawBmp.readUInt8(offset);
            offset += bytesPerColor;
        }
        offset += rowPadding;
    }
}