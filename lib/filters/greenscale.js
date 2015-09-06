"use strict";

exports.name = 'Greenscale filter';

exports.shortFlag = '-g';
exports.longFlag = '--green';
exports.desc = 'Removes all colors except for blue';

exports.convert = function convert(bmpJSON){
    //determine if bmp has a color palette
    if(bmpJSON.hasOwnProperty('colorPalette')) {
        for(var i = 0; i < bmpJSON.colorPalette.length; i++) {
            greenscale(bmpJSON.colorPalette[i]); //call greenscale on every color in color palette
        }
    } else {
        for(var i = 0; i < bmpJSON.pixelMap.length; i++) {
            for(var j = 0; j < bmpJSON.pixelMap[i].length; j++) {
                greenscale(bmpJSON.pixelMap[i][j]); //call greenscale on every element in pixel map
            }
        }
    }
};

//remove channels other than green
function greenscale(pixel){
    var red = colorRemove(pixel.red);
    var green = colorChannel(pixel.green);
    var blue = colorRemove(pixel.blue);

    pixel.red = red;
    pixel.green = green;
    pixel.blue = blue;
};

function colorChannel(color){
    color = color * 1;
    //scale color w/ coefficient. currently no change in color
    return color;
};

function colorRemove(color) {
    color = color * 0;
    //remove channels besides selected color via 0 coefficient
    return color;
};

