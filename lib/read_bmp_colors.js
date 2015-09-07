"use strict";

exports.readSpec = function readSpec(obj) {
    var index,              //loop index
        chunk,          //raw data chunk
        chunkOffset;    //offset of the data chunk to read

    for (index = 0; index < obj.spec.length; index += 1) {
        chunkOffset = obj.spec[index].offset;
        chunk = obj.byteOps['read' + (obj.spec[index].size * 8)].
            call(obj.raw, chunkOffset);
        obj[obj.spec[index].name] = chunk;
    }
};

exports.readPaletteColors = function readPaletteColors(obj) {
    var index,      //loop index
        color,      //index of color
        bits,       //bits to read
        value;      //working value for read bits

    obj.colorPalette = [];
    obj.offset = obj.dibSize + 14;

    for (index = 0; index < obj.numPaletteColors; index++) {

        bits = obj.byteOps.read32.call(obj.raw, obj.offset);
        obj.colorPalette[index] = {};

        for (color = 0; color < obj.bitmask.length; color++) {
            /*jshint bitwise: false*/
            value = (bits & obj.bitmask[obj.colors[color]]) >>>
                obj.bitmaskCounts[obj.colors[color]];

            value /= (obj.bitmask[obj.colors[color]] >>>
            obj.bitmaskCounts[obj.colors[color]]);

            value *= 255;

            obj.colorPalette[index][obj.colors[color]] =
                Math.round(value);
            /*jshint bitwise: true*/
        }

        obj.offset += 4;

    }
};

exports.readPixelColors = function readPixelColors(obj) {
    var x,          //horizontal index of pixelMap
        y,          //vertical index of pixelMap
        bits,       //bits being read
        color,      //index of color
        value;      //working value of read bits

    obj.pixelMap = [];
    /*jshint bitwise:false*/
    for (y = 0; y < obj.height; y++) {

        obj.pixelMap[y] = [];

        for (x = 0; x < obj.width; x++) {

            bits = obj.byteOps['read' + obj.bitsPerPixel].call(obj.raw, obj.offset);

            obj.pixelMap[y][x] = {};

            for (color = 0; color < obj.bitmask.length; color++) {

                value = (bits & obj.bitmask[obj.colors[color]]) >>>
                    obj.bitmaskCounts[obj.colors[color]];

                value /= (obj.bitmask[obj.colors[color]] >>>
                    obj.bitmaskCounts[obj.colors[color]]);

                value *= 255;

                obj.pixelMap[y][x][obj.colors[color]] =
                    Math.round(value);

            }

            obj.offset += (obj.bitsPerPixel / 8);

        }

        obj.offset += obj.rowPadding;

    }
    /*jshint bitwise: true*/
};

exports.readPixelIndices = function readPixelIndices(obj) {
    var x,              //horizontal index of pixelMap
        y,              //vertical index of pixelMap
        bits,           //bits being read
        bitOffset = 0;  //offset of current bits

    obj.pixelMap = [];
    obj.offset = obj.pixelMapOffset;

    /*jshint bitwise:false*/
    for (y = 0; y < obj.height; y++) {

        obj.pixelMap[y] = [];

        for (x = 0; x < obj.width; x++) {

            obj.pixelMap[y][x] = {};

            bits = obj.byteOps.read8.call(obj.raw, obj.offset);

            obj.bitmask.index = (Math.pow(2, obj.bitsPerPixel) - 1) <<
                (8 - bitOffset - obj.bitsPerPixel);

            obj.pixelMap[y][x].index = (bits & obj.bitmask.index) >>>
                (8 - bitOffset - obj.bitsPerPixel);

            bitOffset += obj.bitsPerPixel;

            if (bitOffset === 8) {
                bitOffset = 0;
                obj.offset += 1;
            }

        }

        obj.offset += obj.rowPadding;

    }
    /*jshint bitwise: true*/
};