"use strict";

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
var DIBBitmapCoreHeader = require('./spec/dib_BITMAPCOREHEADER');
var DIBBitmapV2InfoHeader = require('./spec/dib_BITMAPV2INFOHEADER');
var DIBBitmapV3InfoHeader = require('./spec/dib_BITMAPV3INFOHEADER');
var DIBBitmapV4InfoHeader = require('./spec/dib_BITMAPV4INFOHEADER');
var DIBBitmapV5InfoHeader = require('./spec/dib_BITMAPV5INFOHEADER');
var readBuffer = require('./read_Buffer');

exports.bmpToJSON = function (rawBmp, byteOperations) {
    var bmpData = {};

    bmpData.raw = rawBmp;

    readBuffer.setup(byteOperations);

    bufferToSpec(headerSpec, bmpData, rawBmp);

    switch (bmpData.dibSize) {
        case 40:
            bufferToSpec(DIBBitmapInfoHeader, bmpData, rawBmp);
            bmpData.spec = DIBBitmapInfoHeader;
            break;
        case 52:
            bufferToSpec(DIBBitmapV2InfoHeader, bmpData, rawBmp);
            bmpData.spec = DIBBitmapInfoHeader;
            break;
        case 56:
            bufferToSpec(DIBBitmapV3InfoHeader, bmpData, rawBmp);
            bmpData.spec = DIBBitmapInfoHeader;
            break;
        case 108:
            bufferToSpec(DIBBitmapV4InfoHeader, bmpData, rawBmp);
            bmpData.spec = DIBBitmapInfoHeader;
            break;
        case 124:
            bufferToSpec(DIBBitmapV5InfoHeader, bmpData, rawBmp);
            bmpData.spec = DIBBitmapInfoHeader;
            break;
        case 12:
            bufferToSpec(DIBBitmapCoreHeader, bmpData, rawBmp);
            bmpData.spec = DIBBitmapCoreHeader;
            break;
        default:
            throw new Error('unsupported format');
    }

    if (bmpData.compression === 2 || bmpData.compression === 1 ||
        bmpData.compression === 4 || bmpData.compression === 5 ||
        bmpData.compression === 6 || bmpData.compression === 11 ||
        bmpData.compression === 12 || bmpData.compression === 13) {
        throw new Error('cannot handle compression');
    }

    //calculate row size and padding
    bmpData.rowSize = 4 * Math.floor((bmpData.bitsPerPixel * bmpData.width + 31) / 32);
    bmpData.rowPadding = bmpData.rowSize - ((bmpData.bitsPerPixel * bmpData.width) / 8);

    if (bmpData.bitsPerPixel === 32) {
        bufferToPixelMap(bmpData, rawBmp, readBuffer.storeColor32, 32);
    } else if (bmpData.bitsPerPixel === 24) {
        bufferToPixelMap(bmpData, rawBmp, readBuffer.storeColor24, 24);
    } else if (bmpData.bitsPerPixel === 16) {
        bufferToPixelMap(bmpData, rawBmp, readBuffer.storeColor16, 16);
    } else if (bmpData.bitsPerPixel === 8) {
        readPalette(bmpData, rawBmp, readBuffer.storeColor32, 32);
        bufferToPixelMap(bmpData, rawBmp, readBuffer.storeColor8, 8);
    } else if (bmpData.bitsPerPixel === 4) {
        readPalette(bmpData, rawBmp, readBuffer.storeColor32, 32);
        bufferToPixelMap(bmpData, rawBmp, readBuffer.storeColorN, 4);
    } else if (bmpData.bitsPerPixel === 2) {
        readPalette(bmpData, rawBmp, readBuffer.storeColor32, 32);
        bufferToPixelMap(bmpData, rawBmp, readBuffer.storeColorN, 2);
    } else if (bmpData.bitsPerPixel === 1) {
        readPalette(bmpData, rawBmp, readBuffer.storeColor32, 32);
        bufferToPixelMap(bmpData, rawBmp, readBuffer.storeColorN, 1);
    } else {
        throw new Error('unsupported format');
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

function bufferToPixelMap(bmpData, rawBmp, storeColor, bitsPerPixel) {
    var i,
        width,
        j,
        height,
        offset,
        rowPadding,
        bitOffset = 0;

    rowPadding = bmpData.rowPadding;
    offset = bmpData.pixelMapOffset;
    bmpData.pixelMap = [];

    if (bitsPerPixel === 32 || bitsPerPixel === 24 || bitsPerPixel === 8) {
        for (i = 0, height = bmpData.height; i < height; i += 1) {
            bmpData.pixelMap[i] = [];
            for (j = 0, width = bmpData.width; j < width; j += 1) {
                bmpData.pixelMap[i][j] = {};
                offset = storeColor(rawBmp, bmpData.pixelMap[i][j], offset, 'index', bitsPerPixel);
            }
            offset += rowPadding;
        }
    } else if (bitsPerPixel === 16) {
        var bitmask = {
            red: 5,
            green: 6,
            blue: 5
        };
        for (i = 0, height = bmpData.height; i < height; i += 1) {
            bmpData.pixelMap[i] = [];
            for (j = 0, width = bmpData.width; j < width; j += 1) {
                bmpData.pixelMap[i][j] = {};
                offset = storeColor(rawBmp, bmpData.pixelMap[i][j], offset, bitmask);
            }
            offset += rowPadding;
        }
    } else {
        for (i = 0, height = bmpData.height; i < height; i += 1) {
            bmpData.pixelMap[i] = [];
            for (j = 0, width = bmpData.width; j < width; j += 1) {
                bmpData.pixelMap[i][j] = {};
                storeColor(rawBmp, bmpData.pixelMap[i][j], offset, bitOffset, bitsPerPixel);
                bitOffset += bitsPerPixel;
                if (bitOffset >= 8) {
                    bitOffset = 8 - bitOffset;
                    offset += 1;
                }
            }
            offset += rowPadding;
        }
    }
}

function readPalette(bmpData, rawBmp, storeColor) {
    var i,
        offset,
        numColors,
        color;

    bmpData.colorPalette = [];
    offset = 14 + bmpData.dibSize;
    for (i = 0, numColors = bmpData.numPaletteColors; i < numColors; i += 1) {
        color = {};
        offset = storeColor(rawBmp, color, offset);
        bmpData.colorPalette.push(color);
    }
}