"use strict";

var expect = require('chai').expect;
var jsonToBmp = require('../lib/json_to_bmp');
var bmpToJson = require('../lib/bmp_to_json');
var binReader = require('../lib/bin_file_operations').readBinFile;
var binWriter = require('../lib/bin_file_operations').writeBinFile;
var headerspec = require('../lib/spec/header');
var endianFunction = require('../lib/endian_functions');

describe('JSONToBmpNonPalette', function () {
    var nonPaletteJSON;
    var nonPaletteBMP;
    var bmpFileNonPalette;
    before(function (done) {
        binReader('test/non-palette-bitmap.bmp', function (err, data) {
            bmpFileNonPalette = data;
            endianFunction.setFunctions();
            nonPaletteJSON = bmpToJson.bmpToJSON(bmpFileNonPalette, endianFunction);
            nonPaletteBMP = jsonToBmp.JSONtoBmp(nonPaletteJSON, endianFunction);
            done();
        });
    });
    it('should return a object', function () {
        expect(nonPaletteBMP).to.be.a('object');
    });
    it('should have the same length as the file', function () {
        expect(nonPaletteBMP.length).to.be.equal(30054);
    });
    it('should match the original header', function () {
        var assembled = nonPaletteBMP.toString('hex', 0, 18);
        expect(assembled).to.equal('424d66750000000000003600000028000000');
    });
    it('should match the dib', function () {
        var DIB = '280000006400000064000000010018000000000030750000120b0000120b00000000000000000000';
        var assembled = nonPaletteBMP.toString('hex', 0xe, 0x36);
        expect(assembled).to.equal(DIB);
    });
});

describe('JSONToBmpPalette', function () {
    var paletteJSON;
    var paletteBMP;
    var bmpFilePalette;
    before(function (done) {
        binReader('test/palette-bitmap.bmp', function (err, data) {
            endianFunction.setFunctions();
            bmpFilePalette = data;
            paletteJSON = bmpToJson.bmpToJSON(bmpFilePalette, endianFunction);
            paletteBMP = jsonToBmp.JSONtoBmp(paletteJSON, endianFunction);
            done();
        });
    });
    it('should return a object', function () {
        expect(paletteBMP).to.be.a('object');
    });
    it('should have the same length as the file', function () {
        expect(paletteBMP.length).to.be.equal(11078);
    });
    it('should match the original header', function () {
        var assembled = paletteBMP.toString('hex', 0, 18);
        expect(assembled).to.equal('424d462b0000000000003604000028000000');
    });
    it('should match the dib', function () {
        var DIB = '280000006400000064000000010008000000000010270000120b0000120b00000001000000010000';
        var assembled = paletteBMP.toString('hex', 0xe, 0x36);
        expect(assembled).to.equal(DIB);
    });
    it('should match exactly the original', function(){
       expect(paletteBMP).to.be.equal(bmpFilePalette);
    });
});