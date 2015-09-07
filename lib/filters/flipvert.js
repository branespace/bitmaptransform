"use strict";

exports.name = "Vertical flip";

exports.shortFlag = '-v';
exports.longFlag = '--vertical';

exports.desc = 'Reflects the image over the x axis';

exports.convert = function convert(bmpJSON){
    bmpJSON.pixelMap.reverse();
};