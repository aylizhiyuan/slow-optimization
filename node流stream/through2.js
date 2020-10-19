// 通过through2里面的参数其实可以理解为是一个write方法,可读流的实现函数
// var fs = require('fs');
// 例子1
// fs.createReadStream('ex.txt').pipe(through2(function(chunk,enc,callback){
//     for(let i=0;i<chunk.length;i++){
//         if(chunk[i] == 97){
//             chunk[i] == 122; // swap a for z
//         }
//     }
//     this.push(chunk);
//     callback();
// })).pipe(fs.createWriteStream('out.txt')).on('finish',function(){
//     doSomethingSpecial();
// })

// 实现源码

const { Transform } = require('readable-stream');

