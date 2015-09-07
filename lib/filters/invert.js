"use strict";

exports.name = 'Invert colors';
exports.shortFlag = '-i';
exports.longFlag = '--invert';
exports.desc = 'Inverts all colors';

exports.convert = function convert(bmpJSON){
    var i, j;

    if(bmpJSON.hasOwnProperty('colorPalette')){
        for(i = 0; i < bmpJSON.colorPalette.length; i += 1){
            invert(bmpJSON.colorPalette[i]);
        }
    } else {
        for(i = 0; i < bmpJSON.pixelMap.length; i += 1){
            for(j = 0; j < bmpJSON.pixelMap[i].length; j += 1){
                invert(bmpJSON.pixelMap[i][j]);
            }
        }
    }
};

function invert (pixel) {
    var red = invertColor(pixel.red);
    var green = invertColor(pixel.green);
    var blue = invertColor(pixel.blue);
    pixel.red = red ;
    pixel.green = green;
    pixel.blue = blue;
}

function invertColor (color) {
    color = 255 - color;
    return color;
}
