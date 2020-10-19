'use strict'
var Writable = require('stream').Writable

class MyWritable extends Writable {
  // 接受可读流的参数 
  // 1. highWaterMark水位线
  // 2. decodeStrings 是否进行编码(write方法中的编码)，默认是true
  // 3. objectMode 默认是false,字节序
  // 4. emitClose 流被销毁的时候是否发生close事件,默认是true
  constructor(options) {
    super(options)
  }
  _write(chunk, encoding, callback) {
    process.stdout.write(chunk.toString().toUpperCase())
    callback()
  }
}

process.stdin.pipe(new MyWritable())