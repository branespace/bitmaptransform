"use strict";

var readBin = require('../lib/bin_file_operations');
var expect = require('chai').expect;
var fs = require('fs');

var newfile = 'test.txt';

describe('bin_file_operations', function () {
    before(function () {
        if (fs.existsSync(newfile)) {
            fs.unlinkSync(newfile);
        }
    });
    it('should return a buffer', function (done) {
        readBin.readBinFile('test/50x50x24x0000FF.bmp', function (err, data) {
            expect(data).to.be.a('object');
            done();
        });
    });
    it('should throw an error on file not found', function (done) {
        readBin.readBinFile('test/50x60x24x0000FF.bmp', function (err, data) {
            expect(err.errno).to.be.equal(-2);
            done();
        });
    });
    it('should return a buffer of correct length', function (done) {
        readBin.readBinFile('test/50x50x24x0000FF.bmp', function (err, data) {
            expect(data.length).to.be.equal(7654);
            done();
        });
    });
    it('should write a file to disk', function (done) {
        readBin.readBinFile('test/50x50x24x0000FF.bmp', function (err, data) {
            readBin.writeBinFile(newfile, data, function (err) {
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
