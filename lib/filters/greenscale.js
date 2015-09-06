"use strict";

module.exports = function convert(bmpJSON){
    var i, j;
    //determine if bmp has a color palette
    if(bmpJSON.hasOwnProperty('colorPalette')) {
        for(i = 0; i < bmpJSON.colorPalette.length; i++) {
            greenscale(bmpJSON.colorPalette[i]); //call greenscale on every color in color palette
        }
    } else {
        for(i = 0; i < bmpJSON.pixelMap.length; i++) {
            for(j = 0; j < bmpJSON.pixelMap[i].length; j++) {
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

