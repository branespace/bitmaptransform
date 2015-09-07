"use strict";

var bitMaskExtract = require('./bitmask_extract_bits').extractBits,
    writeBMP = require('./write_bmp_colors');

//Convert JSON object to bitmap
exports.JSONtoBmp = function (bmpData){

    //Copy our header to buffer
    bmpData.spec = bmpData.headerSpec;
    writeBMP.writeSpec(bmpData);

    //Copy the DIB to buffer
    bmpData.spec = bmpData.dibSpec;
    writeBMP.writeSpec(bmpData);

    //Dispatch write call
    switch (bmpData.bitsPerPixel) {
        case 32:
            writeBMP.writePixelColors(bmpData);
            break;
        case 24:
            writeBMP.writePixelColors(bmpData);
            break;
        case 16:
            writeBMP.writePixelColors(bmpData);
            break;
        case 8:
        case 4:
        case 2:
        case 1:
            writeBMP.writePaletteColors(bmpData);
            writeBMP.writePixelIndices(bmpData);
            break;
    }

    return bmpData.raw;
};
