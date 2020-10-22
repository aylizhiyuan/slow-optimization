var zlib = require('zlib');
var fs = require('fs');
var assert = require('assert');
var stream = requrie('stream');
var util = require('util');

var crc32 = require('./crc32');

function ZipStream(opt){
    var self = this;
    self.readable = true;
    self.paused = false;
    self.busy = false;
    self.eof = false;
    self.queue = [];
    self.fileptr = 0;
    self.files = [];
    self.options = opt;
}
// 实现继承,zipstream继承于stream流
util.inherits(ZipStream,stream.Stream);
exports.createZip = function(opt){
    return new ZipStream(opt);
}
function convertDate(d){
    var year = d.getFullYear();
    if(year < 1980){
        return (1 << 21 | 1 << 16)
    }
    return ((year-1980) << 25) | ((d.getMonth()+1) << 21) | (d.getDate() << 16) | 
    (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
}
ZipStream.prototype.pause = function(){
    var self = this;
    self.paused = true;
}
ZipStream.prototype.resume = function(){
    var self = this;
    self.paused = false;
    self._read();
}
ZipStream.prototype.destroy = function(){
    var self = this;
    self.readable = false;
}
// 可读流的读取方式重写...
ZipStream.prototype._read = function(){
    var self = this;
    // 如果是暂停，或者readable的值为false,则不调取read方法
    if(!self.readable || self.paused){return;}
    if(self.queue.length > 0){
        var data = self.queue.shift();
        // 触发data事件，并将所有的data数据发射出去....
        self.emit('data',data);
    }
    if(self.eof && self.queue.length === 0){
        
    }
}

