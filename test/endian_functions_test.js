"use strict";

var endian = require('../lib/endian_functions');
var expect = require('chai').expect;

describe('endian switch', function(){
   it('should properly select LE on little endian machine', function(){
       endian.setFunctions();
       expect(endian.write32).to.be.equal(Buffer.prototype.writeUInt32LE);
   });
});