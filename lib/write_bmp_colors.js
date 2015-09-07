"use strict";

//Calculate length of bitmask
function maskLength(mask, count) {
    if (mask) {
        /*jshint bitwise:false*/
        mask >>>= count;
        /*jshint bitwise:true*/
        return (Math.log(mask + 1) / Math.log(2));
    }
    return 0;
}

//Normalize value to fit into bitmask length
function normalizeToMask(value, length) {
    if (length > 0) {
        return Math.round((value / 255) * (Math.pow(2, length) - 1));
    }
    return 0;
}

//Write spec from dataset to output buffer
exports.writeSpec = function writeSpec(obj) {
    var index,              //loop index
        chunk,          //raw data chunk
        chunkOffset;    //offset of the data chunk to read

    for (index = 0; index < obj.spec.length; index += 1) {
        chunkOffset = obj.spec[index].offset;
        chunk = obj[obj.spec[index].name];
        obj.byteOps['write' + (obj.spec[index].size * 8)].
            call(obj.raw, chunk, chunkOffset);
    }

};

//Write palletized colors to output buffer
exports.writePaletteColors = function writePaletteColors(obj) {
    var index,  //index currently being written
        color,  //index of color being written
        bits,   //built up values (32bit)
        value,  //current working color value
        shift;  //bits to shift bitmask

    obj.offset = obj.dibSize + 14;

    for (index = 0; index < obj.numPaletteColors; index++) {

        bits = 0;

        for (color = 0; color < obj.colors.length; color++) {

            shift = maskLength(obj.bitmask[obj.colors[color]],
                obj.bitmaskCounts[obj.colors[color]]);

            value = obj.colorPalette[index][obj.colors[color]];

            value = normalizeToMask(value, shift);

            /*jshint bitwise: false*/
            value <<= obj.bitmaskCounts[obj.colors[color]];

            value >>>= 0;
            bits += value;

        }

        /*jshint bitwise: true*/
        obj.byteOps.write32.call(obj.raw, bits, obj.offset);

        obj.offset += 4;

    }

};

//Write pixel colors to buffer
exports.writePixelColors = function writePixelColors(obj) {
    var x,      //horizontal index of pixelMap
        y,      //vertical index of pixelMap
        bits,   //built up bits to output
        color,  //index of current working color
        value,  //value of index color
        shift;  //bits to left shift

    obj.offset = obj.pixelMapOffset;

    obj.colors.reverse();


    for (y = 0; y < obj.height; y++) {

        for (x = 0; x < obj.width; x++) {

            bits = 0;

            for (color = 0; color < obj.colors.length; color++) {

                shift = maskLength(obj.bitmask[obj.colors[color]],
                    obj.bitmaskCounts[obj.colors[color]]);

                value = obj.pixelMap[y][x][obj.colors[color]];

                value = normalizeToMask(value, shift);
                /*jshint bitwise:false*/
                value <<= obj.bitmaskCounts[obj.colors[color]];

                value >>>= 0;
                bits += value;
                /*jshint bitwise: true*/
            }

            obj.byteOps['write' + obj.bitsPerPixel].call(obj.raw, bits,
                obj.offset);

            obj.offset += obj.bitsPerPixel / 8;

        }

        for (x = 0; x < obj.rowPadding; x++) {
            obj.byteOps.write8.call(obj.raw, 0, obj.offset);
            obj.offset += 1;
        }
    }
};

//Write indexed color indices to buffer
exports.writePixelIndices = function writePixelIndices(obj) {
    var x,      //horizontal index of pixelMap
        y,      //vertical index of pixelMap
        bits,   //bits to write to buffer
        bitOffset = 0;  //offset of bits being written

    obj.offset = obj.pixelMapOffset;

    /*jshint bitwise:false*/
    for (y = 0; y < obj.height; y++) {

        bits = 0;

        for (x = 0; x < obj.width; x++) {
            /*jshint bitwise:false*/
            bits += (obj.pixelMap[y][x].index <<
                (8 - bitOffset - obj.bitsPerPixel));
            /*jshint bitwise: true*/
            bitOffset += obj.bitsPerPixel;
            if (bitOffset === 8) {
                obj.byteOps.write8.call(obj.raw, bits,
                    obj.offset);
                obj.offset += 1;
                bitOffset = 0;
                bits = 0;
            }
        }

        for (x = 0; x < obj.rowPadding; x++) {
            obj.byteOps.write8.call(obj.raw, 0, obj.offset);
            obj.offset += 1;
        }
    }

};