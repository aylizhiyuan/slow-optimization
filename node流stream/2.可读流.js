const { read } = require('fs');
// 一般数据的流向是先读 ----> 内存 ----> 写入
// 可读流的功能就是作为上游,提供数据给下游的


// 可读流通过push方法产生数据,存入readable的缓存中。当调用push(null)的时候,便宣告了流的数据产生的结束
// 正常情况下，创建了一个可读流实例,需要提供一个_read方法,在这个方法中调用push产生数据

var Stream = require('stream');
var readable = Stream.Readable();
var source = ['a','b','c'];
readable._read = function(){
    this.push(source.shift()|| null);
}
// 等价于上面的例子
var Stream = require('stream')
var source = ['a', 'b', 'c']
var readable = Stream.Readable({
  read: function () {
    this.push(source.shift() || null)
  },
})

// 如果是想直接通过读取文件创建可读流,可以直接使用fs.createReadStream


// 下游通过监听data事件(flowing模式)或通过read方法(paused模式),从缓存中获取数据进行消耗


// 1. 自动flowing模式
// 在flowing模式下,readable的数据会持续不断的生产出来，每个数据都会触发一次data事件，通过监听该事件获取数据

var Stream = require('stream');
var source = ['a','b','c'];
var readable = Stream.Readable({
    read:function(){
        this.push(source.shift() || null);
    }
})
// 通常并不直接监听data事件去消耗流,而是通过pipe方法去消耗
readable.on('data',function(data){
    console.log(data);
})

// 2. paused模式
// 在paused模式下，通过readable.read去获取数据
var Stream = require('stream');
var source = ['a','b','c'];
var readable = Stream.Readable({
    read:function(){
        this.push(source.shift()||null)
    }
})
// 这个状态下表示数据可读,并没有真正去读
// 需要调用read方法去主动的读取
readable.on('readable',function(){
    var data;
    while(data = this.read()){ // 这里不做限制的话，就把所有的数据按照缓冲区的大小一次次的拿出来
        console.log(data);
    }
})


