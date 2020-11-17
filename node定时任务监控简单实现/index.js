/*
 * @Descripttion: 新的clis定时任务监控系统
 * @version: 
 * @Author: lizhiyuan
 * @Date: 2020-11-10 10:13:10
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-17 16:30:41
 */
const child_process = require('child_process');
const express = require('express');

const env = process.env.NODE_ENV || 'development';
// 加载配置文件
const cron_config = require('./config').cron_config[env];
// 初始化需要运行的定时任务列表
var taskList = cron_config.cron_list;
// 子进程列表
var tasks = [];


// http服务器监控
const app = express();

app.get('/api',function(req,res){
    console.log("此路径为了对定时任务进行增删改查操作....")
})
app.get("/web",function(req,res){
    console.log("此路径是为了提供一个web界面用来管理所有的定时任务...")
})


// 定时任务的启动..
for(let i=0;i<taskList.length;i++){
    // 保证任务名称的唯一性,坚决不能重复...
    tasks[i] = child_process.fork('./cron.js',[taskList[i].name],{
        env:{
            taskPath:taskList[i].path,
            taskFile:taskList[i].file,
            taskName:taskList[i].name,
            taskArgs:taskList[i].args,
            taskRange:taskList[i].range,
            NODE_ENV:env,
        }
    });
    // 定点记录每个定时任务进程的启动信息
    tasks[i]._name = taskList[i].name;
    tasks[i]._path = taskList[i].path;
    tasks[i]._file = taskList[i].file;
    tasks[i]._range = taskList[i].range;
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

// 当你向父进程发送杀死的信号的时候，需要将所有的子进程全部关闭
process.on("SIGINT",function(){
    try{
        for(let j=0;j<tasks.length;j++){
            process.kill(tasks[j].pid,"SIGKILL");
        }
    }catch(e){
        process.exit(1);
    }
    process.exit(1);
})

// 当向父进程发送kill命令信号的时候,需要将所有的子进程全部关闭
process.on("SIGTERM",function(){
    try{
        for(let k=0;k<tasks.length;k++){
            // 向所有的子进程发送信号
            process.kill(tasks[k].pid,"SIGKILL");
        }
    }catch(e){
        process.exit(1);
    }
    process.exit(1);
})

// 添加一个信号 kill -1 pid号
process.on("SIGHUP",function(){
    // 先将之前的所有的子进程杀死....这样有利于资源的释放...
    for(let t=0;t<tasks.length;t++){
        // 杀死所有存活的进程
        tasks[t].kill("SIGKILL");
    }
    // 内容清空掉，重新生成新的子进程
    tasks = [];
    // 然后将新的子进程重启...
    var newTaskList = require('./config').cron_config[env].cron_list;
    for(let n = 0;n < newTaskList.length;n++){
        tasks[n] = child_process.fork('./cron.js',[newTaskList[n].name],{
            env:{
                taskPath:newTaskList[n].path,
                taskFile:newTaskList[n].file,
                taskName:newTaskList[n].name,
                taskArgs:newTaskList[n].args,
                taskRange:newTaskList[n].range,
                NODE_ENV:env
            }
        });
        // 定点记录每个定时任务进程的启动信息
        tasks[n]._name = newTaskList[n].name;
        tasks[n]._path = newTaskList[n].path;
        tasks[n]._file = newTaskList[n].file;
        tasks[n]._range = newTaskList[n].range;
    }
})
