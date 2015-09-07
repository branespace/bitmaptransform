"use strict";

var writeBuffer = require('./write_buffer'),
    bitMaskExtract = require('./bitmask_extract_bits');

exports.JSONtoBmp = function (bmpData, byteOps) {
    var rawBmp = bmpData.raw,   //Copy original buffer
        pixelConfig = {},       //New object for pixel configuration
        bitmask;                //Bitmask for masked encoding

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

    //Set compression options
    if (bmpData.compression === 3) {
        bitmask = {
            red: bitMaskExtract(bmpData.bitMaskRed),
            green: bitMaskExtract(bmpData.bitMaskGreen),
            blue: bitMaskExtract(bmpData.bitMaskBlue),
            alpha: bitMaskExtract(bmpData.bitMaskAlpha)
        };
    }

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
            pixelMapToBuffer(pixelConfig, bitmask);
            break;
        case 8:
            pixelConfig.write = writeBuffer.writeColor32;
            pixelConfig.bits = bmpData.bitsPerPixel;
            writePalette(pixelConfig);
            pixelConfig.write = writeBuffer.writeColor8;
            pixelMapToBuffer(pixelConfig);
            break;
        default:
            pixelConfig.write = writeBuffer.writeColor32;
            pixelConfig.bits = bmpData.bitsPerPixel;
            writePalette(pixelConfig);
            pixelConfig.write = writeBuffer.writeColorN;
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
function pixelMapToBuffer(pixel, bitmask) {
    var i,          //loop index
        j,          //inner loop index
        rowPadding, //number of bytes padding each row
        offset,     //current offset
        bitOffset = 0,  //individual bit offset
        writeConfig;    //Byte writer configuration

    writeConfig = {
        raw: pixel.raw,
        bits: pixel.bits
    };

    if (bitmask) {
        writeConfig.bitmask = bitmask;
    }

    rowPadding = pixel.json.rowPadding;
    offset = pixel.json.pixelMapOffset;

    //Write 32/24/8 bits to the pixelmap (integer pixel values)
    if (pixel.bits === 32 || pixel.bits === 24 || pixel.bits === 8) {
        for (i = 0; i < pixel.json.pixelMap.length; i += 1) {
            for (j = 0; j < pixel.json.pixelMap[i].length; j += 1) {
                writeConfig.offset = offset;
                writeConfig.data = pixel.json.pixelMap[i][j];
                writeConfig.name = 'index';
                pixel.write(writeConfig);
                offset += pixel.bits / 8;
            }   //pad rows to multiple of 4
            for (j = 0; j < rowPadding; j += 1) {
                writeBuffer.write8Bits(pixel.raw, 0, offset);
                offset += 1;
            }
        }
        //Write sub-byte color values
    } else if (pixel.bits === 16) {
        for (i = 0; i < pixel.json.pixelMap.length; i += 1) {
            for (j = 0; j < pixel.json.pixelMap[i].length; j += 1) {
                writeConfig.data = pixel.json.pixelMap[i][j];
                writeConfig.offset = offset;
                offset = pixel.write(writeConfig);
            }  //Pad rows
            for (j = 0; j < rowPadding; j += 1) {
                writeBuffer.write8Bits(pixel.raw, 0, offset);
                offset += 1;
            }
        }
    } else {
        //Write indices for sub-byte values
        for (i = 0; i < pixel.json.pixelMap.length; i += 1) {

            for (j = 0; j < pixel.json.pixelMap[i].length; j += 1) {
                writeConfig.data = pixel.json.pixelMap[i][j];
                writeConfig.name = 'index';
                writeConfig.offset = offset;
                pixel.write(writeConfig);
                bitOffset += pixel.bits;
                if (bitOffset > 15) {
                    bitOffset = bitOffset - 16;
                    offset += 2;
                }
                if(i === 27 && j === 90){
                    console.log(offset);
                }
            }

            //Stop bit wrap-over
            if (bitOffset > 7) {
                bitOffset -= 8;
                offset += 1;
            }

            //Pad out individual bits to one byte length
            while (bitOffset !== 0) {
                writeConfig.data = 0;
                writeConfig.offset = offset;
                writeConfig.bitsToWrite = (8 - bitOffset);
                pixel.write(writeConfig);
                bitOffset += pixel.bits;
                if (bitOffset > 7) {
                    bitOffset = 0;
                    offset += 1;
                }
            }  //Pad rows

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
        offset,     //current position offset
        writeConfig; //reader configuration object

    writeConfig = {
        raw: pixel.raw,
        bits: pixel.bits
    };

    offset = pixel.json.dibSize + 14;

    for (i = 0; i < pixel.json.colorPalette.length; i += 1) {
        writeConfig.data = pixel.json.colorPalette[i];
        writeConfig.offset = offset;
        offset = pixel.write(writeConfig);
    }
}
