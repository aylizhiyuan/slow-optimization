/*
 * @Author: lizhiyuan
 * @Date: 2020-10-28 17:38:32
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-28 17:53:49
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
    
}
