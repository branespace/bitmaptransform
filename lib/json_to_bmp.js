"use strict";

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');
var DIBBitmapCoreHeader = require('./spec/dib_BITMAPCOREHEADER');
var littleEndian = require('./little_Endian');

exports.JSONtoBmp = function (bmpData) {
    var rawBmp = new Buffer(parseInt(bmpData.fileSize, 16));

    specToBuffer(headerSpec, rawBmp, bmpData);

    if(bmpData.dibtype === 'DIBBITMAPINFOHEADER'){
        specToBuffer(DIBBitmapInfoHeader, rawBmp, bmpData);
    }

    return rawBmp;
};

function specToBuffer(spec, rawBmp, bmpData){
    var i,
        numFields,
        j,
        fieldLength,
        string,
        offset;

    for(i = 0, numFields = spec.length; i < numFields; i += 1){
        string = littleEndian.littleEndianString(bmpData[spec[i].name]);
        string = padWithZero(string, spec[i].size);
        offset = spec[i].offset;
        for(j = 0, fieldLength = spec[i].size * 2; j < fieldLength; j += 2){
            rawBmp[offset] = parseInt(string[j] + string[j + 1], 16);
            offset += 1;
        }
    }
}

function padWithZero(string, byteLength) {
    var padded = string;

    while (padded.length < (byteLength * 2)){
        padded = "00" + padded;
    }

    return padded;
}

function convertDecToHex(number){
    var string = number.toString(16);

    return string;
}