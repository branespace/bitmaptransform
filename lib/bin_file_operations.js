"use strict";

var file = require('fs');

exports.readBinFile = function (filename, callback) {
    file.readFile(filename, function (err, data) {
        callback(err, data);
    });
};

exports.writeBinFile = function (filename, data, callback) {
    file.writeFile(filename, data, function (err) {
        callback(err);
    });
};