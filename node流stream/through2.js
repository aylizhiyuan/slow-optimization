// 通过through2里面的参数其实可以理解为是一个write方法,可读流的实现函数
// var fs = require('fs');
// 例子1
// fs.createReadStream('ex.txt').pipe(through2(function(chunk,enc,callback){
//     for(let i=0;i<chunk.length;i++){
//         if(chunk[i] == 97){
//             chunk[i] == 122; // swap a for z
//         }
//     }
//     this.push(chunk);
//     callback();
// })).pipe(fs.createWriteStream('out.txt')).on('finish',function(){
//     doSomethingSpecial();
// })

// 实现源码

const { Transform } = require('readable-stream');// node核心的流实现
function inherits(fn,sup){
    fn.super_ = sup;
    fn.prototype = Object.create(sup.prototype,{
        constructor: { value: fn, enumerable: false, writable: true, configurable: true }
    })
}
function through2(construct){
    // 怪异的写法,只是为了重新定义through2函数,返回一个新的函数
    // 检查参数的正确性，如正确则直接调用through2里的函数
    // 函数会返回一个transform流
    return (options,transform,flush) => {
        if(typeof options === 'function'){
            flush = transform
            transform = options
            options = {}
        }
        if(typeof transform !== 'function'){
            transform = (chunk,enc,cb) => cb(null,chunk)
        }
        if(typeof flush !== 'function'){
            flush = null;
        }
        return construct(options,transform,flush);
    }
}
const make = through2((options,transform,flush)=>{
    const t2 = new Transform(options);
    t2._transform = transform;
    if(flush){
        t2._flush = flush;
    }
    return t2;
})

const obj = through2(function (options, transform, flush) {
    const t2 = new Transform(Object.assign({ objectMode: true, highWaterMark: 16 }, options))
    t2._transform = transform
    if (flush) {
      t2._flush = flush
    }  
    return t2
})

const ctor = through2((options, transform, flush) => {
    function Through2 (override) {
      if (!(this instanceof Through2)) {
        return new Through2(override)
      }
  
      this.options = Object.assign({}, options, override)
  
      Transform.call(this, this.options)
  
      this._transform = transform
      if (flush) {
        this._flush = flush
      }
    }
  
    inherits(Through2, Transform)
  
    return Through2
})

module.exports = make
module.exports.ctor = ctor
module.exports.obj = obj

