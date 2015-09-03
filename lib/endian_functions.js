"use strict";

var os = require('os');

exports.setFunctions = function setFunctions(){
    if(os.endianness() === 'LE') {
        exports.read32 = Buffer.prototype.readUInt32LE;
        exports.read16 = Buffer.prototype.readUInt16LE;
        exports.read8 = Buffer.prototype.readUInt8;
        exports.write32 = Buffer.prototype.writeUInt32LE;
        exports.write16 = Buffer.prototype.writeUInt16LE;
        exports.write8 = Buffer.prototype.writeUInt8;
    } else {
        exports.read32 = Buffer.prototype.readUInt32BE;
        exports.read16 = Buffer.prototype.readUInt16BE;
        exports.read8 = Buffer.prototype.readUInt8;
        exports.write32 = Buffer.prototype.writeUInt32BE;
        exports.write16 = Buffer.prototype.writeUInt16BE;
        exports.write8 = Buffer.prototype.writeUInt8;
    }

};
