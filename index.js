"use strict";

var binaryFileOps = require('./lib/bin_file_operations');
var bmpToJSON = require('./lib/bmp_to_json');
var JSONToBmp = require('./lib/json_to_bmp');
var byteFunctions = require('./lib/endian_functions');

var grayscale = require('./lib/filters/grayscale');
var bluescale = require('./lib/filters/bluescale');
var redscale = require('./lib/filters/redscale');
var greenscale = require('./lib/filters/greenscale');
var flipHoriz = require('./lib/filters/fliphoriz');
var flipVert = require('./lib/filters/flipvert');
var sepia = require('./lib/filters/sepia');
var invert = require('./lib/filters/invert');

//Make sure we have the parameters we need
if (!process.argv[2]) {
    console.log('No input filename provided: exiting.');
    return false;
}
if (!process.argv[3]) {
    console.log('No output filename provided: exiting.');
    return false;
}
if (!process.argv[4]) {
    console.log('No operation provided: exiting.');
    console.log(' Options: grayscale, invert, red, green, blue');
    return false;
}

console.log('Opening file: ' + process.argv[2]);

//Prep our endianness functions
byteFunctions.setFunctions();

//Read in our bmp
binaryFileOps.readBinFile(process.argv[2], processBMP);

//Processes the bmp received from the reader function
function processBMP(err, data) {
    var rawBMP, //raw input buffer
        bmpJSON;//JSON encoded bitmap

    if (err) {
        console.log(err);
        emitError('Could not read ' + process.argv[2]);
        return false;
    }

    console.log('File Successfully Read.');

    rawBMP = data;

    //Convert bmp raw stream to JSON
    bmpJSON = bmpToJSON.bmpToJSON(rawBMP, byteFunctions);

    //Apply a transform to the JSON object
    transformBMP(process.argv[4], bmpJSON);

    //Convert JSON back to raw bmp
    rawBMP = JSONToBmp.JSONtoBmp(bmpJSON, byteFunctions);

    //Write the raw bitmap
    binaryFileOps.writeBinFile(process.argv[3], rawBMP, cleanUp);
}

//Dispatch the JSON object to the transform functions depending on which transform selected in argument
function transformBMP(transformStyle, bmpJSON) {
    console.log('Applying transformation...');

    if (transformStyle == 'grayscale' || transformStyle == '-gray') {
        grayscale.convert(bmpJSON);
        console.log('applying grayscale');
    } else if (transformStyle == 'invert' || transformStyle == '-i') {
        invert.convert(bmpJSON);
        console.log('inverting image color');
    } else if (transformStyle == 'sepia' || transformStyle == '-s') {
        sepia.convert(bmpJSON);
        console.log('applying sepia filter');
    } else if (transformStyle == 'horizontal' || transformStyle == '-h') {
        flipHoriz.convert(bmpJSON);
        console.log('flipping image horizontally');
    } else if (transformStyle == 'vertical' || transformStyle == '-v') {
        flipVert.convert(bmpJSON);
        console.log('flipping image vertically');
    } else if (transformStyle == 'blue' || transformStyle == '-b') {
        bluescale.convert(bmpJSON);
        console.log('selecting blue channel');
    } else if (transformStyle == 'red' || transformStyle == '-r') {
        redscale.convert(bmpJSON);
        console.log('selecting red channel');
    } else if (transformStyle == 'green' || transformStyle == '-g') {
        greenscale.convert(bmpJSON);
        console.log('selecting green channel');
    } else {
        console.log('Please select a valid transformation');
    }
}

//Final operations after file write
function cleanUp(err) {
    if (err) {
        emitError(err, 'Could not write ' + process.argv[3]);
        return false;
    }
    console.log('File successfully written: ' + process.argv[3]);
    console.log('Closing...');
}

//Print out an error message
function emitError(err, message) {
    console.log('ERROR: ' + message);
    console.log(err.errno + ': ' + err.message);
}
