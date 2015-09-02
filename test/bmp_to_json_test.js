"use strict";

var bmpToJson = require('../lib/bmp_to_json');
var expect = require('chai').expect;
var binReader = require('../lib/bin_file_operations').readBinFile;
var headerspec = require('../lib/spec/header');
var bmp;
var result;

describe('bmpToJson', function () {
    before(function (done) {
        binReader('test/50x50x24x0000FF.bmp', function (err, data) {
            bmp = data;
            result = bmpToJson.bmpToJSON(bmp);
            done();
        });
    });
    it('should return an object', function () {
        expect(result).to.be.a('object');
    });
    it('should have an id of BM', function () {
        // hex for BM
        expect(result.id).to.be.equal(19778);
    });
    it('should match original header', function () {
        var assembled = '';
        for (var i = 0; i < headerspec.length; i += 1) {
            assembled += result[headerspec[i].name];
        }
        expect(assembled).to.equal('197787654005440');
    });
    it('should select correct DIB format', function () {
        expect(result.dibtype).to.equal('DIBBITMAPINFOHEADER');
    });
    it('should get the correct row padding', function(){
        expect(result.rowPadding).to.equal(2);
    });
    it('should have the correct size', function(){
        expect(result.pixelMap[49][49]).to.not.be.equal(null);
    });
    it('should set colors correctly', function(){
        expect(result.pixelMap[32][32].blue).to.be.equal(255);
    });
});