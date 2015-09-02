"use strict";

var jsonToBmp = require('../lib/json_to_bmp');
var bmpToJson = require('../lib/bmp_to_json');
var expect = require('chai').expect;
var binReader = require('../lib/bin_file_operations').readBinFile;
var binWriter = require('../lib/bin_file_operations').writeBinFile;
var headerspec = require('../lib/spec/header');
var bmp;
var result;
var newResult;

describe('JSONToBmp', function () {
    before(function (done) {
        binReader('test/50x50x24x0000FF.bmp', function (err, data) {
            bmp = data;
            result = bmpToJson.bmpToJSON(bmp);
            newResult = jsonToBmp.JSONtoBmp(result);
            done();
        });
    });
    it('should return a object', function () {
        expect(newResult).to.be.a('object');
    });
    it('should have the same length as the file', function () {
        expect(newResult.length).to.be.equal(7654);
    });
    it('should match the original header', function () {
        var assembled = newResult.toString('hex', 0, 18);
        expect(assembled).to.equal('424de61d0000000000003600000028000000');
    });
    it('should match the dib', function () {
        var DIB = '2800000032000000320000000100180000000000b01d000000000000000000000000000000000000';
        var assembled = newResult.toString('hex', 0xe, 0x36);
        expect(assembled).to.equal(DIB);
    });
});