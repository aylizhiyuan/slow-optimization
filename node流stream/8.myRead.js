// 写一个自己创建的可读流
// 按照自己的方式去读,例如按行读,按分隔符去读,按一定的规则去读...
const { Readable } = require('stream');

class MyReadable extends Readable {
  constructor(options) {
    // Calls the stream.Readable(options) constructor.
    super(options);
    // ...
  }
  _read(size){
    // this.push()
  }
}
