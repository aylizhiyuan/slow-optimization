/*
 * @Author: lizhiyuan
 * @Date: 2020-09-25 18:34:26
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-27 12:26:38
 */
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

app.get('/api',function(req,res){
    console.log("此路径为了对定时任务进行增删改查操作....")
})
app.get("/web",function(req,res){
    console.log("此路径是为了提供一个web界面用来管理所有的定时任务")
})
// 定时任务服务器启动的时候将所有的定时任务启动
// 考虑两个问题,当子进程的任务出现失败的时候如何重启?
// 当子进程的任务报错的时候如何及时发现？
for(let i=0;i<taskList.length;i++){
    let taskPath = path.join(__dirname + taskList[i]);
    task[i] = child_process.fork(taskPath);
    // console.log(task[i]);
    task[i].on('message',function(msg){
        // 处理子进程发来消息
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


// 向子进程发送消息,通常就是关闭某个子进程的时候
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
            // 向所有的子进程发送信号
            process.kill(task[k].pid,"SIGKILL");
        }
    }catch(e){
        process.exit(1);
    }
    process.exit(1);
})
// 添加一个信号


