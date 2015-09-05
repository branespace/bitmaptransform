"use strict";

var writeBuffer = require('./write_buffer');

exports.JSONtoBmp = function (bmpData, byteOps) {
    var rawBmp = bmpData.raw;   //Copy original buffer
    var pixelConfig = {};    //New object for pixel configuration

    //Prepare configuration object
    pixelConfig.json = bmpData;
    pixelConfig.raw = rawBmp;

    //Prepare write functions
    writeBuffer.setup(byteOps);
    pixelConfig.write16 = writeBuffer.write16Bits;

    //Copy our header to buffer
    specToBuffer(bmpData.header, rawBmp, bmpData);

    //Copy the DIB to buffer
    specToBuffer(bmpData.spec, rawBmp, bmpData);

    //Dispatch write call
    switch (bmpData.bitsPerPixel) {
        case 32:
            pixelConfig.write = writeBuffer.writeColor32;
            pixelConfig.bits = bmpData.bitsPerPixel;
            pixelMapToBuffer(pixelConfig);
            break;
        case 24:
            pixelConfig.write = writeBuffer.writeColor24;
            pixelConfig.bits = bmpData.bitsPerPixel;
            pixelMapToBuffer(pixelConfig);
            break;
        case 16:
            pixelConfig.write = writeBuffer.writeColor16;
            pixelConfig.bits = bmpData.bitsPerPixel;
            pixelMapToBuffer(pixelConfig);
            break;
        case 8:
            pixelConfig.write = writeBuffer.writeColor32;
            pixelConfig.bits = 32;
            writePalette(pixelConfig);
            pixelConfig.write = writeBuffer.writeColor8;
            pixelConfig.bits = bmpData.bitsPerPixel;
            pixelMapToBuffer(pixelConfig);
            break;
        default:
            pixelConfig.write = writeBuffer.writeColor32;
            pixelConfig.bits = 32;
            writePalette(pixelConfig);
            pixelConfig.write = writeBuffer.writeColorN;
            pixelConfig.bits = bmpData.bitsPerPixel;
            pixelMapToBuffer(pixelConfig);
            break;
    }

    return rawBmp;
};

//Write the header or DIB to the buffer
function specToBuffer(spec, rawBmp, bmpData) {
    var i,              //loop index
        numFields,      //number of header fields
        chunk,          //chunk to write to buffer
        chunkOffset;    //offset of chunk to write

    for (i = 0, numFields = spec.length; i < numFields; i += 1) {
        chunk = bmpData[spec[i].name];
        chunkOffset = spec[i].offset;
        if (spec[i].size === 2) {
            writeBuffer.write16Bits(rawBmp, chunk, chunkOffset);
        } else if (spec[i].size === 4) {
            writeBuffer.write32Bits(rawBmp, chunk, chunkOffset);
        }
    }
}

//Write the pixel map to the buffer
function pixelMapToBuffer(pixel) {
    var i,          //loop index
        j,          //inner loop index
        rowPadding, //number of bytes padding each row
        offset,     //current offset
        bitOffset = 0;  //individual bit offset

    rowPadding = pixel.json.rowPadding;
    offset = pixel.json.pixelMapOffset;
    if (pixel.bits === 32 || pixel.bits === 24 || pixel.bits === 8) {
        for (i = 0; i < pixel.json.pixelMap.length; i += 1) {
            for (j = 0; j < pixel.json.pixelMap[i].length; j += 1) {
                pixel.write(pixel.raw,
                    pixel.json.pixelMap[i][j], offset,
                    'index', pixel.bits);
                offset += pixel.bits / 8;
            }
            for (j = 0; j < rowPadding; j += 1) {
                writeBuffer.write8Bits(pixel.raw, 0, offset);
                offset += 1;
            }
        }
    } else if (pixel.bits === 16) {
        var bitmask = {
            blue: 5,
            green: 6,
            red: 5
        };
        for (i = 0; i < pixel.json.pixelMap.length; i += 1) {
            for (j = 0; j < pixel.json.pixelMap[i].length; j += 1) {
                offset = pixel.write(pixel.raw,
                    pixel.json.pixelMap[i][j], offset, bitmask);
            }
            for (j = 0; j < rowPadding; j += 1) {
                writeBuffer.write8Bits(pixel.raw, 0, offset);
                offset += 1;
            }
        }
    } else {
        for (i = 0; i < pixel.json.pixelMap.length; i += 1) {
            for (j = 0; j < pixel.json.pixelMap[i].length; j += 1) {
                pixel.write(pixel.raw,
                    pixel.json.pixelMap[i][j].index,
                    offset, pixel.bits);
                bitOffset += pixel.bits;
                if (bitOffset > 15) {
                    bitOffset = bitOffset - 16;
                    offset += 2;
                }
            }
            if (bitOffset > 7) {
                bitOffset -= 8;
                offset += 1;
            }
            while (bitOffset !== 0) {
                pixel.write(pixel.raw, 0,
                    offset, 8 - bitOffset);
                bitOffset += pixel.bits;
                if (bitOffset > 7) {
                    bitOffset = 0;
                    offset += 1;
                }
            }
            for (j = 0; j < rowPadding; j += 1) {
                writeBuffer.write8Bits(pixel.raw, 0, offset);
                offset += 1;
            }
        }
    }
}

//Writes the palette to the buffer
function writePalette(pixel) {
    var i,          //loop index
        offset;     //current position offset

    offset = pixel.json.dibSize + 14;

    for (i = 0; i < pixel.json.numPaletteColors; i += 1) {
        offset = pixel.write(pixel.raw,
            pixel.json.colorPalette[i], offset);
    }
}
