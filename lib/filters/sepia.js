"use strict";

module.exports = function convert(bmpJSON) {
    var i, j;

    if (bmpJSON.hasOwnProperty('colorPalette')) {
        for (i = 0; i < bmpJSON.colorPalette.length; i += 1) {
            sepia(bmpJSON.colorPalette[i]);
        }
    } else {
        for (i = 0; i < bmpJSON.pixelMap.length; i += 1) {
            for (j = 0;j < bmpJSON.pixelMap[i].length; j += 1) {
                sepia(bmpJSON.pixelMap[i][j]);
            }
        }
    }
};

function sepia(pixel){
    var depth = 35;
    var gray = Math.round((pixel.blue + pixel.green + pixel.red) / 3);
    pixel.red = Math.min(gray + depth * 2, 255);
    pixel.green = Math.min(gray + depth, 255);
    pixel.blue = Math.max(gray - depth, 0);
}