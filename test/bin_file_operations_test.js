"use strict";

var readBin = require('../lib/bin_file_operations');
var expect = require('chai').expect;
var fs = require('fs');

var newfile = 'test.bmp';

describe('bin_file_operations', function () {
    before(function () {
        if (fs.existsSync(newfile)) {
            fs.unlinkSync(newfile);
        }
    });
    it('should return a buffer', function (done) {
        readBin.readBinFile(__dirname + '/1bit-palette.bmp', function (err, data) {
            expect(Buffer.isBuffer(data)).to.be.equal(true);
            done();
        });
    });
    it('should throw an error on file not found', function (done) {
        readBin.readBinFile('eeepalette-bitmap.bmp', function (err) {
            expect(err.errno).to.be.equal(-2);
            done();
        });
    });
    it('should return a buffer of correct length', function (done) {
        readBin.readBinFile(__dirname + '/1bit-palette.bmp', function (err, data) {
            expect(data.length).to.be.equal(1730);
            done();
        });
    });
    it('should write a file to disk', function (done) {
        readBin.readBinFile(__dirname + '/1bit-palette.bmp', function (err, data) {
            readBin.writeBinFile(newfile, data, function () {
                expect(fs.existsSync(newfile)).to.be.equal(true);
                done();
            });
        });
    });
    after(function () {
        if (fs.existsSync(newfile)) {
            fs.unlinkSync(newfile);
        }
    });
});
