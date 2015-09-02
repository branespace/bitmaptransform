"use strict";

exports.littleEndianBuffer = function reverseLittleEndianBuffer(data) {
    var reversed = new Buffer(data.length),
        i,
        bufLen;

    for (i = 0, bufLen = data.length; i < bufLen; i += 1) {
        reversed[i] = data[bufLen - 1 - i];
    }
    return reversed;
};

exports.littleEndianString = function reverselittleEndianString(data) {
    var i,
        byteArray = [],
        reversed,
        len;

    for(i = 0, len = data.length; i < len; i += 2){
        byteArray.push(data[i] + data[i + 1]);
    }
    reversed = byteArray.reverse().join('');
    return reversed;
};