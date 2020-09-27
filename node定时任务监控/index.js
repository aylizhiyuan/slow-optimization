// 对定时任务要实现监控
// 1. 首先创建对饮的定时任务

var child_process = require('child_process');
var express = require('express');




var app = express();

var task = child_process.fork('./cron.js');
app.listen(8888,function(){
    console.log("定时任务监控系统开启.....");
})

task.on('message',function(msg){
    // 子进程发来消息
    console.log(msg);
})
task.on('close',function(){
    // 子进程关闭的情况
    console.log(`pid-${task.pid} 关闭...`)
})
task.on('error',function(){
    // 子进程失败
    console.log(`pid-${task.pid} 失败...`)
})
task.on('exit',function(){
    // 子进程退出(几乎不会主动退出)
    console.log(`pid-${task.pid} 退出...`)
})
// 向子进程发送消息
// task.send("我是父进程....");

// 保证主进程不会退出....
process.on('uncaughtException', function (err) {
    err.name = "UncaughtExceptionError";
    console.log('Caught exception: ' + err.stack);
});

// 父进程是不不会主动退出的，不用考虑process.on(exit)
// 当你向父进程发送杀死的信号的时候，需要将所有的子进程全部关闭
process.on("SIGINT",function(){
    try{
        process.kill(task.pid,"SIGKILL");
    }catch(e){
        process.exit(1);
    }
    process.exit(1);
})
// 当向父进程发送kill命令信号的时候,需要将所有的子进程全部关闭
process.on("SIGTERM",function(){
    try{
        process.kill(task.pid,"SIGKILL");
    }catch(e){
        process.exit(1);
    }
    process.exit(1);
})


