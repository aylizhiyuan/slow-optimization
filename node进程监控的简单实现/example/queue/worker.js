/*
 * @Author: lizhiyuan
 * @Date: 2020-12-16 14:39:15
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-12-16 14:51:06
 */
var fs = require('fs');
var process = require('process');
// throw new Error("报错"); 子进程的报错会让父进程继续执行并退出....
fs.open('/Users/lizhiyuan/Desktop/log.txt','w',function(err,fd){
    setInterval(function(){
        console.log("子进程在不断的工作...") // 子进程的输出默认是跟跟父进程绑定的...
        fs.write(fd,process.pid+"\n");
    },2000)
})
process.on("exit",function(){
    console.log("子进程退出....");
})