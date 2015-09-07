"use strict";

var os = require('os');

//Select our functions based on endianness of processor
(function setup() {

    //Augment buffer with 24 bit LE reader
    Buffer.prototype.readUInt24LE = function readUInt24LE(offset) {
        var value;  //holds built up dataset
        /*jshint bitwise: false*/
        value = this[offset + 2] << 16;      //Shift rightmost bits left
        value |= (this[offset + 1] << 8);    //Shift middle bits
        value |= this[offset];               //Add left bits
        /*jshint bitwise: true*/
        return value;
    };

    //Augment buffer with 24 but BE reader
    Buffer.prototype.readUInt24BE = function readUInt24BE(offset) {
        var value;  //holds built up dataset
        /*jshint bitwise: false*/
        value = this[offset] << 16;          //Shift leftmost bits left
        value |= (this[offset + 1] << 8);    //Shift middle bits right
        value |= this[offset + 2];           //Add right bits
        /*jshint bitwise: true*/
        return value;
    };

    //Augment buffer with 24 bit LE writer
    Buffer.prototype.writeUInt24LE = function writeUInt24LE(value, offset) {
        /*jshint bitwise: false*/
        this[offset + 2] = (value & 0xff0000) >>> 16;    //Shift top bits
        this[offset + 1] = (value & 0x00ff00) >>> 8;     //Shift middle bits
        this[offset] = value & 0x0000ff;                 //Add bottom bits
        /*jshint bitwise: true*/
    };

    //Augment buffer with 24 bit BE writer
    Buffer.prototype.writeUInt24BE = function writeUInt24BE(value, offset) {
        /*jshint bitwise: false*/
        this[offset] = (value & 0xff0000) >>> 16;        //Shift bottom bits
        this[offset + 1] = (value & 0x00ff00) >>> 8;     //Shift middle bits
        this[offset + 2] = value & 0x0000ff;             //Add top bits
        /*jshint bitwise: true*/
    };

    //These work regardless of endianness
    exports.write8 = Buffer.prototype.writeUInt8;
    exports.read8 = Buffer.prototype.readUInt8;
    var colors = ['alpha', 'blue', 'green', 'red'];//TODO remove colors
    switch (os.endianness()) {
        case 'LE':
            //Little endian functions
            exports.read32 = Buffer.prototype.readUInt32LE;
            exports.read24 = Buffer.prototype.readUInt24LE;
            exports.read16 = Buffer.prototype.readUInt16LE;
            exports.write32 = Buffer.prototype.writeUInt32LE;
            exports.write24 = Buffer.prototype.writeUInt24LE;
            exports.write16 = Buffer.prototype.writeUInt16LE;
            exports.colors = colors;//TODO remove colors
            break;
        case 'BE':
            //Big endian functions
            exports.read32 = Buffer.prototype.readUInt32BE;
            exports.read24 = Buffer.prototype.readUInt24BE;
            exports.read16 = Buffer.prototype.readUInt16BE;
            exports.write32 = Buffer.prototype.writeUInt32BE;
            exports.write24 = Buffer.prototype.writeUInt24BE;
            exports.write16 = Buffer.prototype.writeUInt16BE;
            exports.colors = colors.reverse(); //TODO remove colors
            break;
        default:
            //We'll only get here if we are dealing with middle endian functions
            //We don't support that kind of things
            console.log('Go back to the 80\'s, PDP-11 USER!!!!11!');
            console.log('We don\'t support middle endianness in these parts');
            throw new Error('Architecture not supported');
    }

})();