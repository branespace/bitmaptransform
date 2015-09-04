"use strict";

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
var DIBBitmapCoreHeader = require('./spec/dib_BITMAPCOREHEADER');
var writeBuffer = require('./write_buffer');

exports.JSONtoBmp = function (bmpData, byteOps) {
    var rawBmp = bmpData.raw;

    writeBuffer.setup(byteOps);

    specToBuffer(headerSpec, rawBmp, bmpData);

    specToBuffer(bmpData.spec, rawBmp, bmpData);

    if (bmpData.bitsPerPixel === 32) {
        pixelMapToBuffer(rawBmp, bmpData, writeBuffer.writeColor32, 32);
    } else if (bmpData.bitsPerPixel === 24) {
        pixelMapToBuffer(rawBmp, bmpData, writeBuffer.writeColor24, 24);
    } else if (bmpData.bitsPerPixel === 8) {
        writePalette(rawBmp, bmpData, writeBuffer.writeColor32, 32);
        pixelMapToBuffer(rawBmp, bmpData, writeBuffer.writeColor8, 8);
    }
    return rawBmp;
};

function specToBuffer(spec, rawBmp, bmpData) {
    var i,
        numFields,
        chunk,
        chunkOffset;

    for (i = 0, numFields = spec.length; i < numFields; i += 1) {
        chunk = bmpData[spec[i].name];
        chunkOffset = spec[i].offset;
        if (spec[i].size === 2) {
            writeBuffer.write16Bits(rawBmp, chunk, chunkOffset);
        } else if (spec[i].size === 4) {
            writeBuffer.write32Bits(rawBmp, chunk, chunkOffset);
        }
    }
}

function pixelMapToBuffer(rawBmp, bmpData, writeColor, bitsPerPixel) {
    var i,
        height,
        j,
        width,
        rowPadding,
        offset;

    rowPadding = bmpData.rowPadding;
    offset = bmpData.pixelMapOffset;

    if (bitsPerPixel === 32 || bitsPerPixel === 24 || bitsPerPixel === 8) {
        for (i = 0, height = bmpData.height; i < height; i += 1) {
            for (j = 0, width = bmpData.width; j < width; j += 1) {
                offset = writeColor(rawBmp, bmpData.pixelMap[i][j], offset, 'index');
            }
            for (j = 0; j < rowPadding; j += 1) {
                writeBuffer.write8Bits(rawBmp, 0, offset);
                offset += 1;
            }
        }
    }
}

function writePalette(rawBmp, bmpData, writeColor) {
    var i,
        numColors,
        offset;

    offset = bmpData.dibSize + 14;

    for (i = 0, numColors = bmpData.numPaletteColors; i < numColors; i += 1) {
        offset = writeColor(rawBmp, bmpData.colorPalette[i], offset);
    }
}