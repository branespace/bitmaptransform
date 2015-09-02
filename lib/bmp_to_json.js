"use strict";

var storeColor;

exports.bmpToJSON = function (rawBmp) {
    var bmpData = {};
    var headerSpec = require('./spec/header');
    var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
    var DIBBitmapCoreHeader = require('./spec/dib_BITMAPCOREHEADER');

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

    if(bmpData.bitsPerPixel === 24) {
        storeColor = storeColor24;
        populatePixelArray(bmpData, rawBmp);
    } else if (bmpData.bitsPerPixel === 8) {
        storeColor = storeColor32;
        populatePalette(bmpData, rawBmp);
        storeColor = storeColor8;
        populatePixelArray(bmpData, rawBmp);
    }

    //console.log(bmpData);
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
        offset,
        rowPadding;

    rowPadding = bmpData.rowPadding;
    offset = bmpData.pixelMapOffset;
    bmpData.pixelMap = [];
    for (i = 0, height = bmpData.height; i < height; i += 1) {
        bmpData.pixelMap[i] = [];
        for (j = 0, width = bmpData.width; j < width; j += 1) {
            bmpData.pixelMap[i][j] = {};
            offset = storeColor(bmpData.pixelMap[i][j], rawBmp, offset);
            console.log(bmpData.pixelMap[i][j]);
        }
        offset += rowPadding;
    }
}

function populatePalette(bmpData, rawBmp){
    var i,
        offset,
        numColors,
        color;

    bmpData.colorPalette = [];
    offset = 14 + bmpData.dibSize;
    for (i = 0, numColors = bmpData.numPaletteColors; i < numColors; i += 1){
        color = {};
        offset = storeColor32(color, rawBmp, offset);
        bmpData.colorPalette.push(color);
    }
}

function storeColor32(loc, rawBmp, offset) {
    loc.blue = rawBmp.readUInt8(offset);
    offset += 1;
    loc.green = rawBmp.readUInt8(offset);
    offset += 1;
    loc.red = rawBmp.readUInt8(offset);
    offset += 1;
    loc.alpha = rawBmp.readUInt8(offset);
    offset += 1;
    return offset;
}

function storeColor24(loc, rawBmp, offset){
    loc.blue = rawBmp.readUInt8(offset);
    offset += 1;
    loc.green = rawBmp.readUInt8(offset);
    offset += 1;
    loc.red = rawBmp.readUInt8(offset);
    offset += 1;
    return offset;
}

function storeColor8(loc, rawBmp, offset){
    loc.index = rawBmp.readUInt8(offset);
    offset += 1;
    return offset;
}