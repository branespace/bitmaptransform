"use strict";

var os = require('os');

//Select our functions based on Endianness of processor
exports.setFunctions = function setFunctions(){
    //These work regardless of endianness
    exports.write8 = Buffer.prototype.writeUInt8;
    exports.read8 = Buffer.prototype.readUInt8;

    switch (os.endianness()) {
        case 'LE':
            //Little endian functions
            exports.read32 = Buffer.prototype.readUInt32LE;
            exports.read16 = Buffer.prototype.readUInt16LE;
            exports.write32 = Buffer.prototype.writeUInt32LE;
            exports.write16 = Buffer.prototype.writeUInt16LE;
            exports.endian = 'LE'; //TODO REMOVE AFTER REFACTOR WRITER
            break;
        case 'BE':
            //Big endian functions
            exports.read32 = Buffer.prototype.readUInt32BE;
            exports.read16 = Buffer.prototype.readUInt16BE;
            exports.write32 = Buffer.prototype.writeUInt32BE;
            exports.write16 = Buffer.prototype.writeUInt16BE;
            break;
        default:
            console.log('Go back to the 80\'s, PDP USER!!1!1!oneoneone');
            break;
    }

};
