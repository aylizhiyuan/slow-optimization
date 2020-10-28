/*
 * @Author: lizhiyuan
 * @Date: 2020-09-30 18:18:05
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-28 17:01:02
 */
'use strict'
var Writable = require('stream').Writable

class MyWritable extends Writable {
  // 接受可读流的参数 
  // 1. highWaterMark水位线,并不是每次wirte方法都会调用底层的write,缓冲区写满之后调用底层write写
  // 2. decodeStrings 是否进行编码(write方法中的编码)，默认是true
  // 3. objectMode 默认是false,字节序
  // 4. emitClose 流被销毁的时候是否发生close事件,默认是true
  constructor(options) {
    super(options)
  }
  _write(chunk, encoding, callback) {
    // 写入控制台
    process.stdout.write(chunk.toString().toUpperCase())
    // 写入到文件
    // fs.write(this.fd, chunk, callback);

    callback()
  }
}

process.stdin.pipe(new MyWritable())