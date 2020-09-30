const { read } = require('fs');
// 仔细观察的话你会发现生产数据的时候给push的是一个字符串或者是Null,但是消耗拿出来的确实字节序
// 在创建流的时候，可以制定objectMode为true,这样输出的就是原来的样子

// 1. objectMode下的可读流
var Stream = require('stream');
var source = ['a','','c'];
var readable = Stream.Readable({
    objectMode:true,
    read:function(){
        var data = source.shift();
        data = data == null ? null : data 
        this.push(data); // 可以是任何类型
    }
})
readable.on('end',function(){
    console.log('end');
})
readable.on('data',function(data){
    console.log('data',data);
})

// 2. objectMode下的可写流
