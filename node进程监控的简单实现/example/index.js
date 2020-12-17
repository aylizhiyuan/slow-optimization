/*
 * @Descripttion: 队列启动进程入口
 * @version: 0.1
 * @Author: lizhiyuan
 * @Date: 2020-11-11 10:05:45
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-12-17 17:38:00
 */
const forever = require('forever-monitor');
const path = require('path');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const arguments = process.argv.splice(2);
const rabbitmq_config = require('./config').rabbitmq_config[env] || require(arguments[0]).rabbitmq_config[env];
const taskList = rabbitmq_config.rabbitmq_list;

var tasks = [];
// 检查是否是一个合法的文件，并可读
function isFile(path){
    try{
        fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
        return true
    }catch(e){
        console.log(e);
        return false
    }
}
for(let i=0;i<taskList.length;i++){
    if(isFile(path.join(__dirname,taskList[i].path,taskList[i].file))){
        tasks[i] = new (forever.Monitor)(path.join(__dirname,taskList[i].path,taskList[i].file), {
            "max": taskList[i].max, // 重启的次数
            "silent": taskList[i].silent, // true为关闭 ,false为输出到父进程
            'killTree': taskList[i].killTree,           // 关闭当前进程的时候是否杀死子进程
            'minUptime':taskList[i].minUptime, // 该进程必须启动的最短时间，否则则永远不启动
            'spinSleepTime':taskList[i].spinSleepTime, // 进程重启的时间间隔
            'env':{'NODE_ENV':env},
        })
        // 当前子进程退出的时候触发
        tasks[i].on('exit', function (forever) {
            console.log(`${taskList[i].file}任务退出`)
        });
        // 当前子进程发生错误的时候触发
        tasks[i].on('error',function(err){
            console.log(`${taskList[i].file}任务发生错误...`)
        })
        // 当前子进程开始的时候
        tasks[i].on('start',function(process,data){
            console.log(`${taskList[i].file}任务开始...`)
        })
        // 当前子进程停止的时候
        tasks[i].on("stop",function(process){
            console.log(`${taskList[i].file}任务停止...`)
        })
        // 当前子进程重启的时候
        tasks[i].on('restart',function(forever){
            console.log(`${taskList[i].file}任务重启启动了...`)
        })
        // 当前子进程有输出的时候
        tasks[i].on('stdout',function(data){
            // 
        })
        // 当前子进程有输出错误的时候
        tasks[i].on('stderr',function(data){
            // 
        })
        tasks[i].start();
    }
}
function exit(){
    for(let i=0;i<tasks.length;i++){
        if(tasks[i]) tasks[i].child.kill();
    }
    process.exit(0);
}
['SIGINT','SIGTERM'].forEach(signal => process.on(signal,exit))