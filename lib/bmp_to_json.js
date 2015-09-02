"use strict";

var headerSpec = require('./spec/header');
var DIBBitmapInfoHeader = require('./spec/dib_BITMAPINFOHEADER');

exports.bmpToJSON = function (rawBmp) {
    var bmpData = {};

    //BMP Header
    processSpec(headerSpec, bmpData, rawBmp);

    //Assume V1
    processSpec(DIBBitmapInfoHeader, bmpData, rawBmp);

    return bmpData;
};

function processSpec (spec, object, data){
    var i,
        numFields,
        chunk,
        chunkOffset,
        chunkEnd,
        tempBuffer;

    for(i = 0, numFields = spec.length; i < numFields; i += 1){
        chunkOffset = spec[i].offset;
        chunkEnd = chunkOffset + spec[i].size;
        chunk = data.slice(chunkOffset, chunkEnd);
        tempBuffer = new Buffer(chunk);
        tempBuffer = reverseLittleEndian(tempBuffer);
        object[spec[i].name] = tempBuffer.toString('hex', 0, tempBuffer.length);
    }
}

function reverseLittleEndian(data){
    var reversed = new Buffer(data.length),
        i,
        bufLen;

    for(i = 0, bufLen = data.length; i < bufLen; i += 1){
        reversed[i] = data[bufLen - 1 - i];
    }
    return reversed;
}