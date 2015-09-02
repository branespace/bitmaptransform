"use strict";

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
var DIBBitmapCoreHeader = require('./spec/dib_BITMAPCOREHEADER');
var littleEndian = require('./little_Endian');

exports.bmpToJSON = function (rawBmp) {
    var bmpData = {};

    //BMP Header
    specToProperties(headerSpec, bmpData, rawBmp);

    if (bmpData.dibSize === '00000028') {
        //28 in hex is 40 bytes, thus DIBBITMAPINFOHEADER
        specToProperties(DIBBitmapInfoHeader, bmpData, rawBmp);
        bmpData.dibtype = 'DIBBITMAPINFOHEADER';
    } else if (bmpData.dibSize === '0000000C') {
        //C in hex is 12 bytes, this DIBBITMAPCOREHEADER
        specToProperties(DIBBitmapCoreHeader, bmpData, rawBmp);
        bmpData.dibtype = 'DIBBITMAPCOREHEADER';
    } else {
        throw new Error('unsupported format');
    }

    //calculate row size and padding
    bmpData.rowSize = 4 * Math.floor((parseInt(bmpData.bitsPerPixel, 16) *
            parseInt(bmpData.width, 16) + 31) / 32);
    bmpData.rowPadding = bmpData.rowSize - ((parseInt(bmpData.bitsPerPixel, 16) *
            parseInt(bmpData.width, 16))) / 8;
    populatePixelArray(bmpData, rawBmp);

    return bmpData;
};

function specToProperties(spec, object, data) {
    var i,
        numFields,
        chunk,
        chunkOffset,
        chunkEnd,
        tempBuffer;

    for (i = 0, numFields = spec.length; i < numFields; i += 1) {
        chunkOffset = spec[i].offset;
        chunkEnd = chunkOffset + spec[i].size;
        chunk = data.slice(chunkOffset, chunkEnd);
        tempBuffer = new Buffer(chunk);
        tempBuffer = littleEndian.littleEndianBuffer(tempBuffer);
        object[spec[i].name] = tempBuffer.toString('hex', 0, tempBuffer.length);
    }
}

function populatePixelArray(bmpData, rawBmp) {
    var i,
        width,
        j,
        height,
        pixel,
        bytesPerPixel,
        bytesPerColor,
        offset,
        rowPadding;

    bytesPerPixel = 0x3;
    bytesPerColor = 0x1;
    rowPadding = bmpData.rowPadding;
    offset = parseInt(bmpData.pixelMapOffset, 16);
    bmpData.pixelMap = [];
    for (i = 0, height = parseInt(bmpData.height, 16); i < height; i += 1) {
        bmpData.pixelMap[i] = [];
        for (j = 0, width = parseInt(bmpData.width, 16); j < width; j += 1) {
            pixel = rawBmp.slice(offset, offset + bytesPerPixel);
            bmpData.pixelMap[i][j] = {};
            readColor('blue', bmpData.pixelMap[i][j], rawBmp.slice(offset,
                offset + bytesPerColor), bytesPerColor);
            offset += bytesPerColor;
            bmpData.pixelMap[i][j].green = parseInt(littleEndian.littleEndianBuffer(rawBmp.slice(offset,
                offset + bytesPerColor)).toString('hex', 0, bytesPerColor), 16);
            offset += bytesPerColor;
            bmpData.pixelMap[i][j].red = parseInt(littleEndian.littleEndianBuffer(rawBmp.slice(offset,
                offset + bytesPerColor)).toString('hex', 0, bytesPerColor), 16);
            offset += bytesPerColor;
        }
        offset += rowPadding;
    }
}

function readColor(color, pixelMap, buffer, bytesPerColor){
    pixelMap[color] = parseInt(littleEndian.littleEndianBuffer(buffer).
        toString('hex', 0, bytesPerColor), 16);
}