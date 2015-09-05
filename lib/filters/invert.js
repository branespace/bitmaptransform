"use strict";

module.exports = function convert(bmpJSON){
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
  var red = colorLuminance(pixel.red);
  var green = colorLuminance(pixel.green);
  var blue = colorLuminance(pixel.blue);
  invertedValue = 255 - invertedValue;
  pixel.red = invertedValue ;
  pixel.green = invertedValue;
  pixel.blue = invertedValue;
}

function colorLuminance (color) {
  color = color - 255;
  return color;
}
