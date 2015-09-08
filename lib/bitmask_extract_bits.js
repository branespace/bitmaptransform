"use strict";

//Extract the number of bits in the bitmask
exports.extractBits = function extractBits(bitmask) {
    var mask = bitmask, //bitmask working value
        count;

    count = countTrailing(mask);

    mask = bitmask >>> count;                //shift off trailing zeroes

    mask = Math.log(mask + 1) / Math.log(2);    //get number of bits

    return mask;
    /*jshint bitwise: true*/
};

exports.countTrailing = countTrailing;

function countTrailing(num) {
    var count = 0;      //number of bits to shift mask

    //counting method thanks to Sean Eron Anderson
    // Public Domain, no license
    // https://graphics.stanford.edu/~seander/bithacks.html
    //  Method: ZerosOnRightLinear
    //  Commentary by: Gregory Irwin (branespace)

    //return empty mask
    if (num === 0) {
        return 0;
    }

    /*jshint bitwise: false*/
    if (!(num & 1)) {                //see if the mask is not right aligned
        num = (num ^ (num - 1)) >> 1;    //set trailing zeroes to ones
        while (num & 1) {                  //while we still have ones bits...
            count++;                        //add to the count to shift
            num >>= 1;                     //and shift one
        }
    } else {
        count = 0;                          //right aligned, no shift needed
    }

    return count;
}