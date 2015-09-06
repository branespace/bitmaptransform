"use strict";

module.exports = function convert(bmpJSON){
    for(var i = 0; i < bmpJSON.pixelMap.length; i += 1){
        bmpJSON.pixelMap[i].reverse();
    }
};