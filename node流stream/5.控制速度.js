// 底层读写文件,例如read函数会将fd所指的文件传送一定数量的字节到buf指针所指的内存中去
// 设置这个highWaterMark的主要目的是控制从底层读取数据的速度
// 你可以理解为fs.read ---> read(fd,array,highWaterMark)
// 每次去调用on('data')或者on("readable")调用的时候,缓冲区的大小 == highWaterMark,这时候会把
// 缓冲区里面所有的数据读出来,读出来之后,缓冲区的大小 < highWaterMark,变会继续调用底层的read填充缓冲区

// 这么做其实的好处很明显,毕竟我们不能频繁的调用read方法一次次的读取数据,读到一部分的数据后缓存起来

let fs = require('fs')
let rs = fs.createReadStream('./1.txt',{
    highWaterMark:3 // 读取三个字节,三个字节读完之后再去底层读文件
})
//一旦调用data就进入了流动模式
// rs.on('data',function(data){
//     console.log(data);
// })
// rs.on('end',function(){
//     console.log('end');
// })

rs.on('readable',function(){
    let ch = rs.read(1);//从缓冲区里面读取一个字节,其实缓冲区是有3个字节的...
    console.log(ch);
    // 当你读了一个字节后，发现剩了两个字节，不够highWaterMark，会再次读取highWaterMark个字节，就变成5个字节了。。
    // 这种情况只能说明我们的理论是对的,拿到的数据尽量去消费掉...
    setTimeout(()=>{
        console.log(rs._readableState.length); // 这个应该跟highWaterMark是一致的...
    },200)
})
