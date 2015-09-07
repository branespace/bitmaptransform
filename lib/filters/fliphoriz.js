"use strict";

exports.name = "Horizontal flip";

exports.shortFlag = '-h';
exports.longFlag = '--horizontal';

exports.desc = 'Reflects the image over the y axis';

exports.convert = function convert(bmpJSON){
    for(var i = 0; i < bmpJSON.pixelMap.length; i += 1){
        bmpJSON.pixelMap[i].reverse();
    }
};