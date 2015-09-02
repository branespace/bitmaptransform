"use strict";

module.exports = function reverseLittleEndian(data) {
    var reversed = new Buffer(data.length),
        i,
        bufLen;

    for (i = 0, bufLen = data.length; i < bufLen; i += 1) {
        reversed[i] = data[bufLen - 1 - i];
    }
    return reversed;
};