"use strict";

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
var DIBBitmapCoreHeader = require('./spec/dib_BITMAPCOREHEADER');

exports.JSONtoBmp = function (bmpData) {
    var rawBmp = new Buffer(bmpData.fileSize);

    specToBuffer(headerSpec, rawBmp, bmpData);

    if (bmpData.dibtype === 'DIBBITMAPINFOHEADER') {
        specToBuffer(DIBBitmapInfoHeader, rawBmp, bmpData);
    }

    flattenPixelMap(rawBmp, bmpData);

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
        bytesPerColor,
        rowPadding,
        offset;

    bytesPerColor = bmpData.bytesPerColor;
    rowPadding = bmpData.rowPadding;
    offset = bmpData.pixelMapOffset;

    for (i = 0, height = bmpData.height; i < height; i += 1) {
        for (j = 0, width = bmpData.width; j < width; j += 1) {
            rawBmp.writeUInt8(bmpData.pixelMap[i][j].blue, offset);
            offset += bytesPerColor;
            rawBmp.writeUInt8(bmpData.pixelMap[i][j].green, offset);
            offset += bytesPerColor;
            rawBmp.writeUInt8(bmpData.pixelMap[i][j].red, offset);
            offset += bytesPerColor;
        }
        for(j = 0; j < rowPadding; j += 1){
            rawBmp.writeUInt8(0, offset);
            offset += 1;
        }
    }
}

