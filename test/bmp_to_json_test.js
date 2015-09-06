"use strict";

var bmpToJson = require('../lib/bmp_to_json');
var expect = require('chai').expect;
var binReader = require('../lib/bin_file_operations').readBinFile;
var headerSpec = require('../lib/spec/header');
var endianFunction = require('../lib/endian_functions');
var bmp;
var result;

describe('bmpToJson', function () {
    before(function (done) {
        binReader('test/palette-bitmap.bmp', function (err, data) {
            bmp = data;
            endianFunction.setFunctions();
            result = bmpToJson.bmpToJSON(bmp, endianFunction);
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
        for (var i = 0; i < headerSpec.length; i += 1) {
            assembled += result[headerSpec[i].name];
        }
        expect(assembled).to.equal('197781107800107840');
    });
    it('should select correct DIB format', function () {
        expect(result.spec).to.not.equal(null);
    });
    it('should get the correct row padding', function(){
        expect(result.rowPadding).to.equal(0);
    });
    it('should have the correct size', function(){
        expect(result.pixelMap[99][99]).to.not.be.equal(null);
    });
    it('should set colors correctly', function(){
        expect(result.colorPalette[3].blue).to.be.equal(49);
    });
});