// 对定时任务要实现监控
// 1. 首先创建对饮的定时任务

const child_process = require('child_process');
const express = require('express');
var path = require('path');
// 加载配置文件
const server_config = require('./server_config.json');
const taskList = server_config.cronList;


const app = express();
var task = [];


for(let i=0;i<taskList.length;i++){
    let taskPath = path.join(__dirname + taskList[i]);
    task[i] = child_process.fork(taskPath);
    task[i].on('message',function(msg){
        // 子进程发来消息
        console.log(msg);
    })
    task[i].on('close',function(){
        // 子进程关闭的情况
        console.log(`pid-${task[i].pid} 关闭...`)
    })
    task[i].on('error',function(){
        // 子进程失败
        console.log(`pid-${task[i].pid} 失败...`)
    })
    task[i].on('exit',function(){
        // 子进程退出(几乎不会主动退出)
        console.log(`pid-${task[i].pid} 退出...`)
    })
}
app.listen(8888,function(){
    console.log("定时任务监控系统开启.....");
})


// 向子进程发送消息
// task.send("我是父进程....");

// 保证主进程不会退出....类似于全局范围内的try{}catch(){}
process.on('uncaughtException', function (err) {
    err.name = "UncaughtExceptionError";
    console.log('Caught exception: ' + err.stack);
});

// 父进程是不不会主动退出的，不用考虑process.on(exit)
// 当你向父进程发送杀死的信号的时候，需要将所有的子进程全部关闭
process.on("SIGINT",function(){
    try{
        for(let j=0;j<task.length;j++){
            console.log(task[j].pid);
            process.kill(task[j].pid,"SIGKILL");
        }
    }catch(e){
        process.exit(1);
    }
    process.exit(1);
})
// 当向父进程发送kill命令信号的时候,需要将所有的子进程全部关闭
process.on("SIGTERM",function(){
    try{
        for(let k=0;k<task.length;k++){
            process.kill(task[k].pid,"SIGKILL");
        }
    }catch(e){
        process.exit(1);
    }
    process.exit(1);
})


