
// 可写流的功能是作为下游，消耗上游提供的数据

var Stream = require('stream');
var writable = Stream.Writable({
    write:function(data,_,next){
        console.log(data);
        process.nextTick(next);
    }
})
writable.write('a')
writable.write('b')
writable.write('c')
writable.end()

// 可写流的话一般用fs.createWriteStream来对文件进行写入,调用write("需要写入的内容");