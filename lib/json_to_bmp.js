"use strict";

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
var DIBBitmapCoreHeader = require('./spec/dib_BITMAPCOREHEADER');
var writeBuffer = require('./write_buffer');

exports.JSONtoBmp = function (bmpData, byteOps) {
    var rawBmp = new Buffer(bmpData.fileSize);

    writeBuffer.setup(byteOps);

    specToBuffer(headerSpec, rawBmp, bmpData);

    if (bmpData.dibtype === 'DIBBITMAPINFOHEADER') {
        specToBuffer(DIBBitmapInfoHeader, rawBmp, bmpData);
    }

    if(bmpData.bitsPerPixel === 8){
        writePalette(rawBmp, bmpData, writeBuffer.writeColor32);
        flattenPixelMap(rawBmp, bmpData, writeBuffer.writeColor8);
    } else if (bmpData.bitsPerPixel === 24) {
        flattenPixelMap(rawBmp, bmpData, writeBuffer.writeColor24);
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
            writeBuffer.write16Bits(rawBmp, string, offset);
        } else if (spec[i].size === 4) {
            writeBuffer.write32Bits(rawBmp, string, offset);
        }
    }
}

function flattenPixelMap(rawBmp, bmpData, writePixel) {
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
            offset = writePixel(rawBmp, bmpData.pixelMap[i][j], offset, 'index');
        }
        for(j = 0; j < rowPadding; j += 1){
            writeBuffer.write8Bits(rawBmp, 0, offset);
            offset += 1;
        }
    }
}

function writePalette(rawBmp, bmpData, writePixel) {
    var i,
        numColors,
        offset;

    offset = bmpData.dibSize + 14;

    for (i = 0, numColors = bmpData.numPaletteColors; i < numColors; i += 1) {
        offset = writePixel(rawBmp, bmpData.colorPalette[i], offset);
    }
}