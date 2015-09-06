"use strict";

//Extract the number of bits in the bitmask
module.exports = function extractBits(bitmask) {
    var mask = bitmask, //bitmask working value
        count = 0;      //number of bits to shift mask

    //counting method thanks to Sean Eron Anderson
    // Public Domain, no license
    // https://graphics.stanford.edu/~seander/bithacks.html
    //  Method: ZerosOnRightLinear
    //  Commentary by: Gregory Irwin (branespace)

    //return empty mask
    if (mask === 0) {
        return 0;
    }

    /*jshint bitwise: false*/
    if (!(mask & 1)) {                //see if the mask is not right aligned
        mask = (mask ^ (mask - 1)) >> 1;    //set trailing zeroes to ones
        while (mask & 1) {                  //while we still have ones bits...
            count++;                        //add to the count to shift
            mask >>= 1;                     //and shift one
        }
    } else {
        count = 0;                          //right aligned, no shift needed
    }

    mask = bitmask >> count;                //shift off trailing zeroes

    mask = Math.log(mask + 1) / Math.log(2);    //get number of bits

    return mask;
    /*jshint bitwise: true*/
};