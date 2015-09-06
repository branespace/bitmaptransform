"use strict";

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
var DIBBitmapCoreHeader = require('./spec/dib_BITMAPCOREHEADER');
var DIBBitmapV2InfoHeader = require('./spec/dib_BITMAPV2INFOHEADER');
var DIBBitmapV3InfoHeader = require('./spec/dib_BITMAPV3INFOHEADER');
var DIBBitmapV4InfoHeader = require('./spec/dib_BITMAPV4INFOHEADER');
var DIBBitmapV5InfoHeader = require('./spec/dib_BITMAPV5INFOHEADER');
var readBuffer = require('./read_Buffer');
var bitMaskExtract = require('./bitmask_extract_bits');

exports.bmpToJSON = function (rawBmp, byteOperations) {
    var bmpData = {},       //json object holding bmp fields
        pixelConfig,        //configuration for pixel reads
        bitmask;            //bitmask for compressed colors

    bmpData.raw = rawBmp;
    bmpData.header = headerSpec;

    readBuffer.setup(byteOperations);

    bufferToSpec(headerSpec, bmpData, rawBmp);

    //Identify and set DIB header
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

    //Verify that we can handle this pconpression type
    if (bmpData.compression === 2 || bmpData.compression === 1 ||
        bmpData.compression === 4 || bmpData.compression === 5 ||
        bmpData.compression === 6 || bmpData.compression === 11 ||
        bmpData.compression === 12 || bmpData.compression === 13) {
        throw new Error('cannot handle compression');
    } else if (bmpData.compression === 3) {
        bitmask = {
            red: bitMaskExtract(bmpData.bitMaskRed),
            green: bitMaskExtract(bmpData.bitMaskGreen),
            blue: bitMaskExtract(bmpData.bitMaskBlue),
            alpha: bitMaskExtract(bmpData.bitMaskAlpha)
        };
    }

    bmpData.rowSize = 4 * Math.floor((bmpData.bitsPerPixel * bmpData.width + 31) / 32);
    bmpData.rowPadding = bmpData.rowSize - ((bmpData.bitsPerPixel * bmpData.width) / 8);
    bmpData.rowPadding = Math.floor(bmpData.rowPadding);
    pixelConfig = {
        raw: rawBmp,
        json: bmpData
    };

    //Select and process pixelmaps/colorpalettes by bits per pixel
    switch (bmpData.bitsPerPixel) {
        case 32:
            pixelConfig.read = readBuffer.storeColor32;
            pixelConfig.bits = bmpData.bitsPerPixel;
            bufferToPixelMap(pixelConfig);
            break;
        case 24:
            pixelConfig.read = readBuffer.storeColor24;
            pixelConfig.bits = bmpData.bitsPerPixel;
            bufferToPixelMap(pixelConfig);
            break;
        case 16:
            pixelConfig.read = readBuffer.storeColor16;
            pixelConfig.bits = bmpData.bitsPerPixel;
            bufferToPixelMap(pixelConfig, bitmask);
            break;
        case 8:
            pixelConfig.read = readBuffer.storeColor32;
            pixelConfig.bits = 32;
            readPalette(pixelConfig);
            pixelConfig.read = readBuffer.storeColor8;
            pixelConfig.bits = bmpData.bitsPerPixel;
            bufferToPixelMap(pixelConfig);
            break;
        case 4:
            pixelConfig.read = readBuffer.storeColor32;
            pixelConfig.bits = 32;
            readPalette(pixelConfig);
            pixelConfig.read = readBuffer.storeColorN;
            pixelConfig.bits = bmpData.bitsPerPixel;
            bufferToPixelMap(pixelConfig);
            break;
        case 2:
            pixelConfig.read = readBuffer.storeColor32;
            pixelConfig.bits = 32;
            readPalette(pixelConfig);
            pixelConfig.read = readBuffer.storeColorN;
            pixelConfig.bits = bmpData.bitsPerPixel;
            bufferToPixelMap(pixelConfig);
            break;
        case 1:
            pixelConfig.read = readBuffer.storeColor32;
            pixelConfig.bits = 32;
            readPalette(pixelConfig);
            pixelConfig.read = readBuffer.storeColorN;
            pixelConfig.bits = bmpData.bitsPerPixel;
            bufferToPixelMap(pixelConfig);
            break;
        default:
            throw new Error('unsupported format');
    }

    return bmpData;

};

//Reads the raw buffer, loading our object with the spec fields
function bufferToSpec(spec, object, data) {
    var i,              //loop index
        numFields,      //number of fields in the spec
        chunk,          //raw data chunk
        chunkOffset;    //offset of the data chunk to read

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

//Reads the buffer into the pixel map
function bufferToPixelMap(pixel, bitmask) {
    var i,      //loop index
        width,  //width of image
        j,      //loop index
        height, //height of image
        offset, //current offset
        rowPadding,     //end of row padding in bytes
        bitOffset = 0,  //offset if we're reading individual bits
        readConfig;     //reader configuration object

    rowPadding = pixel.json.rowPadding;
    offset = pixel.json.pixelMapOffset;
    pixel.json.pixelMap = [];
    readConfig = {
        raw: pixel.raw,
        bits: pixel.bits,
        loc: null,
        offset: null,
        bitOffset: 0,
        name: null
    };

    if (bitmask) {
        readConfig.bitmask = bitmask;
    }

    //Colors using integer byte values for pixelmap
    if (pixel.bits === 32 || pixel.bits === 24 || pixel.bits === 8) {
        for (i = 0, height = pixel.json.height; i < height; i += 1) {
            pixel.json.pixelMap[i] = [];
            for (j = 0, width = pixel.json.width; j < width; j += 1) {
                pixel.json.pixelMap[i][j] = {};
                readConfig.offset = offset;
                readConfig.name = 'index';
                readConfig.loc = pixel.json.pixelMap[i][j];
                offset = pixel.read(readConfig);
            }
            offset += rowPadding;
        }
    } else if (pixel.bits === 16) {
        //16 bit colors utilize a bitmask
        for (i = 0, height = pixel.json.height; i < height; i += 1) {
            pixel.json.pixelMap[i] = [];
            for (j = 0, width = pixel.json.width; j < width; j += 1) {
                pixel.json.pixelMap[i][j] = {};
                readConfig.offset = offset;
                readConfig.loc = pixel.json.pixelMap[i][j];
                offset = pixel.read(readConfig);
            }
            offset += rowPadding;
        }
    } else {
        //Read sub-byte indices
        for (i = 0, height = pixel.json.height; i < height; i += 1) {
            pixel.json.pixelMap[i] = [];
            for (j = 0, width = pixel.json.width; j < width; j += 1) {
                pixel.json.pixelMap[i][j] = {};
                readConfig.offset = offset;
                readConfig.bitOffset = bitOffset;
                readConfig.loc = pixel.json.pixelMap[i][j];
                pixel.read(readConfig);
                bitOffset += pixel.bits;
                if (bitOffset >= 8) {
                    bitOffset = 8 - bitOffset;
                    offset += 1;
                }
            }
            if (bitOffset !== 0) {
                bitOffset = 0;
                offset += 1;
            }
            offset += rowPadding;
        }
    }
}

//Read a color palette into the JSON object
function readPalette(pixel) {
    var i,          //loop index
        offset,     //current offset
        color,      //color object to hold RGB/A values
        readConfig; //reader configuration object

    readConfig = {
        raw: pixel.raw,
        loc: null,
        offset: null
    };
    pixel.json.colorPalette = [];
    offset = 14 + pixel.json.dibSize;

    for (i = 0; i < pixel.json.numPaletteColors; i += 1) {
        color = {};
        readConfig.loc = color;
        readConfig.offset = offset;
        offset = pixel.read(readConfig);
        pixel.json.colorPalette.push(color);
    }
}