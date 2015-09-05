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
    var bmpData = {};       //json object holding bmp fields
    var pixelConfig = {};   //configuration for pixel reads

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
    } else if (bmpData.compression === 3){

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
            bufferToPixelMap(pixelConfig);
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
function bufferToPixelMap(pixel) {
    var i,      //loop index
        width,  //width of image
        j,      //loop index
        height, //height of image
        offset, //current offset
        rowPadding,     //end of row padding in bytes
        bitOffset = 0;  //offset if we're reading individual bits

    rowPadding = pixel.json.rowPadding;
    offset = pixel.json.pixelMapOffset;
    pixel.json.pixelMap = [];

    if (pixel.bits === 32 || pixel.bits === 24 || pixel.bits === 8) {
        for (i = 0, height = pixel.json.height; i < height; i += 1) {
            pixel.json.pixelMap[i] = [];
            for (j = 0, width = pixel.json.width; j < width; j += 1) {
                pixel.json.pixelMap[i][j] = {};
                offset = pixel.read(pixel.raw, pixel.json.pixelMap[i][j], offset, 'index', pixel.bits);
            }
            offset += rowPadding;
        }
    } else if (pixel.bits === 16) {
        var bitmask = {
            red: 5,
            green: 6,
            blue: 5
        };
        for (i = 0, height = pixel.json.height; i < height; i += 1) {
            pixel.json.pixelMap[i] = [];
            for (j = 0, width = pixel.json.width; j < width; j += 1) {
                pixel.json.pixelMap[i][j] = {};
                offset = pixel.read(pixel.raw, pixel.json.pixelMap[i][j], offset, bitmask);
            }
            offset += rowPadding;
        }
    } else {
        for (i = 0, height = pixel.json.height; i < height; i += 1) {
            pixel.json.pixelMap[i] = [];
            for (j = 0, width = pixel.json.width; j < width; j += 1) {
                pixel.json.pixelMap[i][j] = {};
                pixel.read(pixel.raw, pixel.json.pixelMap[i][j], offset, bitOffset, pixel.bits);
                bitOffset += pixel.bits;
                if (bitOffset >= 8) {
                    bitOffset = 8 - bitOffset;
                    offset += 1;
                }
            }
            if(bitOffset !== 0){
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
        numColors,  //number of colors in the palette
        color;      //color object to hold RGB/A values

    pixel.json.colorPalette = [];
    offset = 14 + pixel.json.dibSize;
    for (i = 0, numColors = pixel.json.numPaletteColors; i < numColors; i += 1) {
        color = {};
        offset = pixel.read(pixel.raw, color, offset);
        pixel.json.colorPalette.push(color);
    }
}