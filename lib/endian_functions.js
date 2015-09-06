"use strict";

var os = require('os');

//Select our functions based on endianness of processor
exports.setFunctions = function setFunctions() {
    //These work regardless of endianness
    exports.write8 = Buffer.prototype.writeUInt8;
    exports.read8 = Buffer.prototype.readUInt8;
    var colors = ['alpha', 'blue', 'green', 'red'];
    switch (os.endianness()) {
        case 'LE':
            //Little endian functions
            exports.read32 = Buffer.prototype.readUInt32LE;
            exports.read16 = Buffer.prototype.readUInt16LE;
            exports.write32 = Buffer.prototype.writeUInt32LE;
            exports.write16 = Buffer.prototype.writeUInt16LE;
            exports.colors = colors;
            break;
        case 'BE':
            //Big endian functions
            exports.read32 = Buffer.prototype.readUInt32BE;
            exports.read16 = Buffer.prototype.readUInt16BE;
            exports.write32 = Buffer.prototype.writeUInt32BE;
            exports.write16 = Buffer.prototype.writeUInt16BE;
            exports.colors = colors.reverse();
            break;
        default:
            //We'll only get here if we are dealing with middle endian functions
            //We don't support that kind of things
            console.log('Go back to the 80\'s, PDP-11 USER!!!!11!');
            console.log('We don\'t support middle endianness in these parts');
            throw new Error('Architecture not supported');
    }

};
