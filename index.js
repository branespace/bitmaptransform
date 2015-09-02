"use strict";

var binaryFileOps = require('./lib/bin_file_operations');
var bmpToJSON = require('./lib/bmp_to_json');
var JSONToBmp = require('./lib/json_to_bmp');

//Make sure we have the parameters we need
if(!process.argv[2]){
    console.log('No input filename provided: exiting.');
    return false;
}
if(!process.argv[3]){
    console.log('No output filename provided: exiting.');
    return false;
}
if(!process.argv[4]){
    console.log('No operation provided: exiting.');
    console.log(' Options: grayscale, invert, red, green, blue');
    return false;
}

console.log('Opening file: ' + process.argv[2]);

binaryFileOps.readBinFile(process.argv[2], processBMP);

function processBMP(err, data){
    var rawBMP,
        bmpJSON;
    if (err){
        emitError('Could not read ' + process.argv[2]);
        return false;
    }

    console.log('File Successfully Read.');

    rawBMP = data;

    bmpJSON = bmpToJSON.bmpToJSON(rawBMP);

    transformBMP(bmpJSON);

    rawBMP = JSONToBmp.JSONtoBmp(bmpJSON);

    binaryFileOps.writeBinFile(process.argv[3], rawBMP, cleanUp);
}

function transformBMP(bmpJSON){
    console.log('Applying transformation...');


}

function cleanUp(err){
    if(err){
        emitError(err, 'Could not write ' + process.argv[3]);
        return false;
    }
    console.log('File successfully written: ' + process.argv[3]);
    console.log('Closing...');
}

function emitError(err, message){
    console.log('ERROR: ' + message);
    console.log(err.errno + ': ' + err.message);
}