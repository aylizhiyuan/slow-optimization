// 写一个自己创建的可读流
// 按照自己的方式去读,例如按行读,按分隔符去读,按一定的规则去读...
var Readable = require('stream').Readable;
var util = require('util');
util.inherits(MyReadable,Readable);
function MyReadable(){
    // 继承传统的可读流
    Readable.call(this,{objectMode:true})
}
MyReadable.prototype._read = function(){
    
}
