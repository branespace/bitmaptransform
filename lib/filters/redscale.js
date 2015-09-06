"use strict";

module.exports = function convert(bmpJSON){
    //determine if bmp has a color palette
    if(bmpJSON.hasOwnProperty('colorPalette')) {
        for(var i = 0; i < bmpJSON.colorPalette.length; i++) {
            redscale(bmpJSON.colorPalette[i]); //call redscale on every color in color palette
        }
    } else {
        for(var i = 0; i < bmpJSON.pixelMap.length; i++) {
            for(var j = 0; j < bmpJSON.pixelMap[i].length; j++) {
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
};

function colorChannel(color){
    color = color * 1;
    //enhance color w/ coefficient. currently no change in color
    return color;
};

function colorRemove(color) {
    color = color * 0;
    //remove channels besides selected color via 0 coefficient
    return color;
};

