"use strict";

var file = require('fs');

//Read ASYNC a bin file to buffer
exports.readBinFile = function (filename, callback) {
    file.readFile(filename, function (err, data) {
        callback(err, data);
    });
};

//Write ASYNC a bin file from buffer
exports.writeBinFile = function (filename, data, callback) {
    file.writeFile(filename, data, function (err) {
        callback(err);
    });
};