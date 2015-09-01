"use strict";

var headerSpec = require('./spec/header');

module.exports = function (rawBmp) {
    var bmpData = {},
        pointer,
        i,
        len,
        chunk;

    //BMP Header

    for(i = 0, len = headerSpec.length; i < len; i += 1){
        chunk = rawBmp.slice(pointer, headerSpec[i].size);
        bmpData[headerSpec[i].name] = chunk.toString('ascii', 0, chunk.length);
    }

    return bmpData;
};