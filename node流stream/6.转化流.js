// transform继承自Duplex,但是将内部的两个缓存给关联起来了。简单的说就是调用write(data)
// 之后经过_transform处理后，下游可以读取到处理后的数据

var Stream = require('stream')

var transform = Stream.Transform({
  transform: function (buf, _, next) {
    next(null, buf.toString().toUpperCase())
  }
})

transform.pipe(process.stdout)

transform.write('a')
transform.write('b')
transform.end('c')