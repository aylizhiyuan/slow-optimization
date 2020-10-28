/*
 * @Author: lizhiyuan
 * @Date: 2020-09-30 18:17:54
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-28 16:40:26
 */
// 写一个自己创建的可读流
// 按照自己的方式去读,例如按行读,按分隔符去读,按一定的规则去读...
const { Readable } = require('stream');

class MyReadable extends Readable {
  // 1. highWaterMark水位线
  // 2. encoding使用指定的字符编码将 buffer 解码成字符串,一般针对buffer
  // 3. objectMode 是否可以是一个对象流

  constructor(options) {
    // Calls the stream.Readable(options) constructor.
    super(options);
    // ...
  }
  _read(size){
    // 对于非对象模式的流， chunk 必须是字符串、 Buffer 或 Uint8Array。  对于对象模式的流， chunk 可以是任何 JavaScript 值
    // this.push() 最后一定是个null结尾的
  }
}
