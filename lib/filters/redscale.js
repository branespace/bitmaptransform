"use strict";

exports.name = 'Redscale filter';

exports.shortFlag = '-r';
exports.longFlag = '--red';
exports.desc = 'Removes all colors except for red';

exports.convert = function convert(bmpJSON){
    var i, j;
    //determine if bmp has a color palette
    if(bmpJSON.hasOwnProperty('colorPalette')) {
        for(i = 0; i < bmpJSON.colorPalette.length; i++) {
            redscale(bmpJSON.colorPalette[i]); //call redscale on every color in color palette
        }
    } else {
        for(i = 0; i < bmpJSON.pixelMap.length; i++) {
            for(j = 0; j < bmpJSON.pixelMap[i].length; j++) {
                redscale(bmpJSON.pixelMap[i][j]); //call redscale on every element in pixel map
            }
        }
    }
};

//remove channels other than red
function redscale(pixel){
    var red = colorChannel(pixel.red);
    var green = colorRemove(pixel.green);
    var blue = colorRemove(pixel.blue);

    pixel.red = red;
    pixel.green = green;
    pixel.blue = blue;
}

function colorChannel(color){
    color = color * 1;
    //scale color w/ coefficient
    return color;
}

function colorRemove(color) {
    color = color * 0;
    //remove channels besides selected color via 0 coefficient
    return color;
}

