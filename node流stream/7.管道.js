// 可读流提供了一个pipe方法,例如readable.pipe(writeable)
// 上游必须是可读的，下游必须是可写的

var Stream = require('stream');
var readable = CreateReadable();
var writable = CreateWritable();

readable.on('data',function(data){
    var ret = writable.write(data);
    if(ret === false){
        readable.pause();
    } 
})
// 可写流没有东西可写的时候再调用可读流进行读取...
// 这样是为了防止写的速度比读的速度快造成的...

writable.on('drain',function(){
    readable.resume();
})
readable.on('end',function(data){
    writable.end();
})
writable.on('finish',function(){
    console.log('done')
})

// 可写流的话将数据输出到控制台
function CreateWritable(){
    return Stream.Writable({
        write:function(data,_,next){
            console.log(data);
            next();
        }
    })
}

// 可读流将数据塞入
function CreateReadable(){
    var source = ['a','b','c']
    return Stream.Readable({
        read:function(){
            process.nextTick(
                this.push.bind(this),source.shift() || null
            )
        }
    })
}