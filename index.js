"use strict";

var binaryFileOps = require('./lib/bin_file_operations');   //Reader/Writer
var bmpToJSON = require('./lib/bmp_to_json');               //Convert BMP to JSON
var JSONToBmp = require('./lib/json_to_bmp');               //Convert JSON to BMP
var byteFunctions = require('./lib/endian_functions');      //Endian definitions

//Load available transforms as objects
var transformLoader = [
    require('./lib/filters/grayscale'),
    require('./lib/filters/bluescale'),
    require('./lib/filters/redscale'),
    require('./lib/filters/greenscale'),
    require('./lib/filters/fliphoriz'),
    require('./lib/filters/flipvert'),
    require('./lib/filters/sepia'),
    require('./lib/filters/invert'),
    {   //Default, no change non-filter
        name: 'None', shortFlag: '-n', longFlag: '--none', desc: "No Filter",
        convert: function () {
        }
    }
];

//Dictionary for transforms
var transforms = {};

//Store transaforms in dictionary and sort
for (var i = 0; i < transformLoader.length; i++) {
    transforms[transformLoader[i].shortFlag] = transformLoader[i];
    transforms[transformLoader[i].longFlag] = transformLoader[i];
}
transformLoader.sort(function (a, b) {
    if (a.shortFlag > b.shortFlag) {
        return 1;
    }
    if (a.shortFlag < b.shortFlag) {
        return -1;
    }
    return 0;
});

//Make sure we have the parameters we need
if (!process.argv[2]) {
    console.log('No operation provided: exiting.');
    console.log(' Select --help for help or --list for options');
    return false;
}
if (process.argv[2] === '--list') {
    listTransforms();
    return false;
} else if (process.argv[2] === '--help') {
    showHelp();
    return false;
}
if (!process.argv[3]) {
    console.log('No input filename provided: exiting.');
    return false;
}
if (!process.argv[4]) {
    console.log('No output filename provided: exiting.');
    return false;
}

console.log('Opening file: ' + process.argv[3]);

//Read in our bmp
binaryFileOps.readBinFile(process.argv[3], processBMP);

//Processes the bmp received from the reader function
function processBMP(err, data) {
    var rawBMP, //raw input buffer
        bmpJSON;//JSON encoded bitmap

    if (err) {
        emitError(err, 'Could not read ' + process.argv[3]);
        return false;
    }

    console.log('File Successfully Read.');

    rawBMP = data;

    //Convert bmp raw stream to JSON
    try {
        bmpJSON = bmpToJSON.bmpToJSON(rawBMP, byteFunctions);
    } catch (e) {
        emitError(e, 'Error loading bitmap: exiting');
        return false;
    }

    //Apply a transform to the JSON object
    transformBMP(process.argv[2], bmpJSON);

    //Convert JSON back to raw bmp
    rawBMP = JSONToBmp.JSONtoBmp(bmpJSON, byteFunctions);

    //Write the raw bitmap
    binaryFileOps.writeBinFile(process.argv[4], rawBMP, cleanUp);
}

//Dispatch the JSON object to the transform functions depending on which transform selected in argument
function transformBMP(transformStyle, bmpJSON) {
    console.log('Applying transformation...');

    if (transforms.hasOwnProperty(transformStyle)) {
        console.log('Selecting ' + transforms[transformStyle].name);
        transforms[transformStyle].convert(bmpJSON);
    } else {
        console.log('Please select a valid transformation');
    }
}

//Final operations after file write
function cleanUp(err) {
    if (err) {
        emitError(err, 'Could not write ' + process.argv[4]);
        return false;
    }
    console.log('File successfully written: ' + process.argv[4]);
    console.log('Closing...');
}

//Print out an error message
function emitError(err, message) {
    console.log('ERROR: ' + message);
    console.log(err.errno + ': ' + err.message);
}

//Display helpfile
function showHelp() {
    var fs = require('fs');
    console.log(fs.readFileSync('./docs/help').toString('utf8'));
}

//Display list of transformations
function listTransforms() {
    var pad,          //Minimum padding length
        transform,    //Index of transform
        space,        //Index of space padding
        spacing = ''; //Padding string

    console.log('Available transformations:\n');
    for (transform = 0; transform < transformLoader.length; transform++) {
        spacing = '';
        pad = 16 - transformLoader[transform].longFlag.length;
        for (space = 0; space < pad; space++) {
            spacing += ' ';
        }
        console.log('  ' + transformLoader[transform].shortFlag + ' ' +
            transformLoader[transform].longFlag + spacing +
            transformLoader[transform].desc);
    }
}
