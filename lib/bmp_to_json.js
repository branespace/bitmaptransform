"use strict";

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
var DIBBitmapCoreHeader = require('./spec/dib_BITMAPCOREHEADER');
var DIBBitmapV2InfoHeader = require('./spec/dib_BITMAPV2INFOHEADER');
var DIBBitmapV3InfoHeader = require('./spec/dib_BITMAPV3INFOHEADER');
var DIBBitmapV4InfoHeader = require('./spec/dib_BITMAPV4INFOHEADER');
var DIBBitmapV5InfoHeader = require('./spec/dib_BITMAPV5INFOHEADER');
var readBMP = require('./read_bmp_colors');
var bitMaskExtract = require('./bitmask_extract_bits').countTrailing;

exports.bmpToJSON = function (rawBmp, byteOperations) {
    var bmpData = {};       //json object holding bmp fields

    //Build data object
    bmpData.raw = rawBmp;
    bmpData.header = headerSpec;
    bmpData.headerSpec = headerSpec;
    bmpData.byteOps = byteOperations;
    bmpData.spec = bmpData.headerSpec;

    //Read the header spec
    readBMP.readSpec(bmpData);

    //Identify and set DIB header
    switch (bmpData.dibSize) {
        case 40:
            bmpData.dibSpec = DIBBitmapInfoHeader;
            break;
        case 52:
            bmpData.dibSpec = DIBBitmapV2InfoHeader;
            break;
        case 56:
            bmpData.dibSpec = DIBBitmapV3InfoHeader;
            break;
        case 108:
            bmpData.dibSpec = DIBBitmapV4InfoHeader;
            break;
        case 124:
            bmpData.dibSpec = DIBBitmapV5InfoHeader;
            break;
        case 12:
            bmpData.dibSpec = DIBBitmapCoreHeader;
            break;
        default:
            throw new Error('unsupported format');
    }

    //Read the DIB spec (now that we know what it is)
    bmpData.spec = bmpData.dibSpec;
    readBMP.readSpec(bmpData);

    //Verify that we can handle this pconpression type
    if (bmpData.compression === 2 || bmpData.compression === 1 ||
        bmpData.compression === 4 || bmpData.compression === 5 ||
        bmpData.compression === 6 || bmpData.compression === 11 ||
        bmpData.compression === 12 || bmpData.compression === 13) {
        throw new Error('cannot handle compression');
    } else if (bmpData.compression === 3) { //Bitmasked
        //Set bitmasks and their lengths
        bmpData.bitmaskCounts = {
            red: bitMaskExtract(bmpData.bitMaskRed),
            green: bitMaskExtract(bmpData.bitMaskGreen),
            blue: bitMaskExtract(bmpData.bitMaskBlue),
            alpha: bitMaskExtract(bmpData.bitMaskAlpha)
        };
        bmpData.bitmask = {
            red: bmpData.bitMaskRed,
            blue: bmpData.bitMaskBlue,
            green: bmpData.bitMaskGreen,
            alpha: bmpData.bitMaskAlpha
        };
    }

    //Finish setting up bitmap data object
    bmpData.rowSize = 4 * Math.floor((bmpData.bitsPerPixel * bmpData.width + 31) / 32);
    bmpData.rowPadding = bmpData.rowSize - ((bmpData.bitsPerPixel * bmpData.width) / 8);
    bmpData.rowPadding = Math.floor(bmpData.rowPadding);
    bmpData.colors = ['red', 'green', 'blue', 'alpha'];
    bmpData.offset = bmpData.pixelMapOffset;

    //Select and process pixelmaps/colorpalettes by bits per pixel
    switch (bmpData.bitsPerPixel) {
        case 32:
            bmpData.bitmask = bmpData.bitmask || {
                    red: 0xff000000,
                    green: 0x00ff0000,
                    blue: 0x0000ff00,
                    alpha: 0x000000ff
                };
            bmpData.bitmaskCounts = bmpData.bitmaskCounts || {
                    blue: 8,
                    green: 16,
                    red: 24,
                    alpha: 0
                };
            bmpData.bitmask.length = 4;
            readBMP.readPixelColors(bmpData);
            break;
        case 24:
            bmpData.bitmask = bmpData.bitmask || {
                    blue: 0x000000ff,
                    green: 0x0000ff00,
                    red: 0x00ff0000,
                    alpha: 0x0000000
                };
            bmpData.bitmaskCounts = bmpData.bitmaskCounts || {
                    red: 16,
                    green: 8,
                    blue: 0,
                    alpha: 0
                };
            bmpData.bitmask.length = 4;
            readBMP.readPixelColors(bmpData);
            break;
        case 16:
            bmpData.bitmask.length = 4;
            readBMP.readPixelColors(bmpData);
            break;
        case 8:
        case 4:
        case 2:
        case 1:
            bmpData.bitmask = bmpData.bitmask || {
                    red: 0x00ff0000,
                    green: 0x0000ff00,
                    blue: 0x000000ff,
                    alpha: 0xff000000
                };
            bmpData.bitmaskCounts = bmpData.bitmaskCounts || {
                    blue: 0,
                    green: 8,
                    red: 16,
                    alpha: 24
                };
            bmpData.bitmask.length = 4;
            readBMP.readPaletteColors(bmpData);
            readBMP.readPixelIndices(bmpData);
            break;
        default:
            throw new Error('unsupported format');
    }

    return bmpData;
};