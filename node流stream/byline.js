/*
 * @Author: lizhiyuan
 * @Date: 2020-10-28 17:38:32
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-28 18:09:18
 */
var stream = require('stream');
var util = require('util');
var timers = require('timers');
// byline(fs.createRreadStream('sample.txt'))
module.exports = function(readStream,options){
    return module.exports.createStream(readStream,options);
}
// byline.createStream(stream)
module.exports.createStream = function(readStream,options){
    if(readStream){
        // 如果传递了一个可读流的话,直接调用函数,返回结果
        return createLineStream(readStream,options);
    }else{
        // 如果没有可读流的话，创建一个行流返回
        return new LineStream(options);
    }
}
module.exports.LineStream = LineStream;

function createLineStream(readStream,options){
    // 容错
    if(!readStream){
        throw new Error('expected readStream')
    }
    if(!readStream.readable){
        throw new Error('readable must be readalbe')
    }
    // 输出到行流中去... ,因为是一个Transform流,可以on(data)消耗
    var ls = new LineStream(options);
    readStream.pipe(ls);
    return ls
}
function LineStream(options){
    // 继承转化流
    stream.Transform.call(this,options);
    options = options || {};
    this._readableState.objectMode = true;
    this._lineBuffer = [];
    this._keepEmptyLines = options._keepEmptyLines || false;
    this._lastChunkEndedWithCR = false;
    var self = this;
    this.on('pipe',function(src){
        if(!self.encoding){
            if(src instanceof stream.Readable){
                // 如果消耗的是一个可读流的话,则把当前的编码设置为消耗时候的编码
                self.encoding = src._readableState.encoding;
            }
        }
    })
}
util.inherits(LineStream,stream.Transform);
LineStream.prototype._transform = function(chunk,encoding,done){

}
LineStream.prototype._pushBuffer = function(encoding,keep,done){

}
LineStream.prototype._flush = function(done){
    this._pushBuffer(this._chunkEncoding,0,done);
}
LineStream.prototype._reencode = function(line,chunkEncoding){
    if(this.encoding && this.encoding != chunkEncoding){
        return new Buffer(line, chunkEncoding).toString(this.encoding);
    }else if(this.encoding){
        return line;
    }else{
        return new  Buffer(line,chunkEncoding);
    }
}
