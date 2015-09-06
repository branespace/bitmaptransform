"use strict";

module.exports = function convert(bmpJSON){
    var i, j;

    if(bmpJSON.hasOwnProperty('colorPalette')){
        for(i = 0; i < bmpJSON.colorPalette.length; i += 1){
            grayscale(bmpJSON.colorPalette[i]);
        }
    } else {
        for(i = 0; i < bmpJSON.pixelMap.length; i += 1){
            for(j = 0; j < bmpJSON.pixelMap[i].length; j += 1){
                grayscale(bmpJSON.pixelMap[i][j]);
            }
        }
    }
};

function grayscale(pixel){
    var red = colorLuminance(pixel.red);
    var green = colorLuminance(pixel.green);
    var blue = colorLuminance(pixel.blue);
    var luminance = imageLuminance(red, green, blue);
    var grayValue = colorValue(luminance);
    grayValue = Math.round(grayValue * 255);
    pixel.red = grayValue ;
    pixel.green = grayValue;
    pixel.blue = grayValue;
}

function colorLuminance(color){
    //Colorimetric values from CIE 1931
    if(( color / 255) < 0.04) {
        color = (color / 255) / 12.92;
    } else {
        color = Math.pow(((color / 255) + 0.055) / 1.055, 2.4);
    }
    color = Math.min(color, 1);
    color = Math.max(color, 0);
    return color;
}

function imageLuminance(red, green, blue){
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function colorValue(lum){
    if (lum <= 0.0031308){
        return 12.19 * lum;
    } else {
        return 1.055 * Math.pow(lum, 1/2.4) - 0.055;
    }
}
