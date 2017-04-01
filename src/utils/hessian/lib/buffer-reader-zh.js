"use strict";

var assert = require('assert');

function BufferReader(buffer) {
    buffer = buffer || new Buffer(0);
    assert(Buffer.isBuffer(buffer), 'A Buffer must be provided');
    this.buf = buffer;
    this.offset = 0;
}

BufferReader.prototype.append = function(buffer) {
    assert(Buffer.isBuffer(buffer), 'A Buffer must be provided');
    this.buf = Buffer.concat([this.buf, buffer]);
    return this;
};

BufferReader.prototype.tell = function() {
    return this.offset;
};

BufferReader.prototype.seek = function(pos) {
    assert(pos >= 0 && pos <= this.buf.length, 'Position is Invalid');
    this.offset = pos;
    return this;
};

BufferReader.prototype.move = function(diff) {
    assert(this.offset + diff >= 0 && this.offset + diff <= this.buf.length, 'Difference is Invalid');
    this.offset += diff;
    return this;
};


BufferReader.prototype.restAll = function() {
    var remain = this.buf.length - this.offset;
    assert(remain >= 0, 'Buffer is not in normal state: offset > totalLength');
    var buf = new Buffer(remain);
    this.buf.copy(buf, 0, this.offset);
    this.offset = this.buf.length;
    return buf;
};


BufferReader.prototype.nextBuffer = function(length) {
    assert(length >= 0, 'Length must be no negative');
    assert(this.offset + length <= this.buf.length, "Out of Original Buffer's Boundary");
    var buf = new Buffer(length);
    this.buf.copy(buf, 0, this.offset, this.offset + length);
    this.offset += length;
    return buf;
};

BufferReader.prototype.nextString = function(length, encoding) {
    assert(length >= 0, 'Length must be no negative');
    assert(this.offset + length <= this.buf.length, "Out of Original Buffer's Boundary");

    this.offset += length;
    return this.buf.toString(encoding || 'utf8', this.offset - length, this.offset);
};

BufferReader.prototype.nextString2 = function(length, encoding) {
    assert(length >= 0, 'Length must be no negative');
    assert(this.offset + length <= this.buf.length, "Out of Original Buffer's Boundary");

    var _offset = this.offset;
    for(var i = 0; i < length; i++){
        // console.log('---------- index : %s, first: %s', i, this.offset);
        this.offset = parseUTF8Char(this.buf, this.offset);
        // console.log('---------- index : %s, result: %s', i, this.offset);
    }
    if(this.offset > this.buf.length) this.offset = this.buf.length;
    return this.buf.toString(encoding || 'utf8', _offset, this.offset);
};
BufferReader.prototype.nextDouble = function() {
    var re = 0;
    if(this.offset + 3 < this.buf.length){
        var b32 = this.buf[this.offset ++] & 0xff;
        var b24 = this.buf[this.offset ++] & 0xff;
        var b16 = this.buf[this.offset ++] & 0xff;
        var b8 = this.buf[this.offset ++] & 0xff;
        re = (b32 << 24) + (b24 << 16) + (b16 << 8) + b8;
    }else{
        var b32 = this.buf.length <= this.offset ? -1 : (this.buf[this.offset ++] & 0xff);
        var b24 = this.buf.length <= this.offset ? -1 : (this.buf[this.offset ++] & 0xff);
        var b16 = this.buf.length <= this.offset ? -1 : (this.buf[this.offset ++] & 0xff);
        var b8 = this.buf.length <= this.offset ? -1 : (this.buf[this.offset ++] & 0xff);
        re = (b32 << 24) + (b24 << 16) + (b16 << 8) + b8;
    }
    return re * 0.001;
};

function parseInt() {
    
}

function parseUTF8Char(buf, _index){
    if(_index +1 > buf.length) return _index;
    var ch = buf[_index ++] & 0xff;
    if(ch < 0x80)
        return _index;
    else if ((ch & 0xe0) == 0xc0){
        _index ++;
        return _index;
    }else if((ch & 0xf0) == 0xe0){
        _index ++;
        _index ++;
        return _index;
    }else{

    }
    /*switch (buf[this.offset] & 0xff){
     case : 0x00: case 0x01: case 0x02: case 0x03:
     case 0x04: case 0x05: case 0x06: case 0x07:
     case 0x08: case 0x09: case 0x0a: case 0x0b:
     case 0x0c: case 0x0d: case 0x0e: case 0x0f:

     case 0x10: case 0x11: case 0x12: case 0x13:
     case 0x14: case 0x15: case 0x16: case 0x17:
     case 0x18: case 0x19: case 0x1a: case 0x1b:
     case 0x1c: case 0x1d: case 0x1e: case 0x1f:
     }*/
}

function MAKE_NEXT_READER(valueName, size) {
    valueName = cap(valueName);
    BufferReader.prototype['next' + valueName] = function() {
        assert(this.offset + size <= this.buf.length, "Out of Original Buffer's Boundary");
        var val = this.buf['read' + valueName](this.offset);
        this.offset += size;
        return val;
        // return formatFloat(valueName, val);
    };
}

function formatFloat(valueName, val){
    if('DoubleBE' != valueName) return val;
    var _v = val.toString();
    var _index = _v.indexOf('\.');
    if(_index == -1) return val;
    if(_index + 7 >= _v.length) return val;
    _v = _v.substr(0, _index + 7);
    _index = _v.length - 1;
    while(_v.charAt(_index) === '0')
        _index --;
    _v = _v.substr(0, _index + 1);
    return parseFloat(_v);
}

function MAKE_NEXT_READER_BOTH(valueName, size) {
    MAKE_NEXT_READER(valueName + 'LE', size);
    MAKE_NEXT_READER(valueName + 'BE', size);
}

MAKE_NEXT_READER('Int8', 1);
MAKE_NEXT_READER('UInt8', 1);
MAKE_NEXT_READER_BOTH('UInt16', 2);
MAKE_NEXT_READER_BOTH('Int16', 2);
MAKE_NEXT_READER_BOTH('UInt32', 4);
MAKE_NEXT_READER_BOTH('Int32', 4);
MAKE_NEXT_READER_BOTH('Float', 4);
MAKE_NEXT_READER_BOTH('Double', 8);

function cap(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


module.exports = BufferReader;