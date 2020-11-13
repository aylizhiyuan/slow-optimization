/*
 * @Author: lizhiyuan
 * @Date: 2020-10-28 17:38:32
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-13 10:13:25
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
    encoding = encoding || 'utf8'
    if(Buffer.isBuffer(chunk)){
        // 假设是字节序
        if(encoding == 'buffer'){
            chunk = chunk.toString(); // utf8
            encoding = 'utf8';
        }
    }else{
        // 不是字节序
        chunk = chunk.toString(encoding);
    }
    this._chunkEncoding = encoding;
    var lines = chunk.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/g); // 根据换行来切换
    if(this._lastChunkEndedWithCR && chunk[0] == '\n'){
        lines.shift();
    }
    if(this._lineBuffer.length > 0){
        this._lineBuffer[this._lineBuffer.length - 1] += lines[0];
        lines.shift();
    }
    this._lastChunkEndedWithCR = chunk[chunk.length - 1] == '\r';
    this._lineBuffer = this._lineBuffer.concat(lines);
    this._pushBuffer(encoding, 1, done);
}
LineStream.prototype._pushBuffer = function(encoding,keep,done){
    while(this._lineBuffer.length > keep){
        var line = this._lineBuffer.shift();
        if(this._keepEmptyLines || line.length > 0){
            if(!this.push(this._reencode(line,encoding))){
                var self = this;
                timers.setImmediate(function(){
                    self._pushBuffer(encoding,keep,done)
                })
                return;
            }
        }
    }
    done();
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
