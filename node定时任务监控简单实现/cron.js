/*
 * @Author: lizhiyuan
 * @Date: 2020-09-25 18:34:37
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-28 10:01:09
 */ 
// 子进程收到消息的时候的处理...
process.on("message",function(msg){
    console.log(`子进程收到消息: ${msg}`);
})

const CronJob = require('cron').CronJob;
const path = require('path');
const fs = require('fs');
const taskPath = process.env.taskPath.toString();
const taskFile = process.env.taskFile.toString();
const taskName = process.env.taskName.toString();
const taskRange = process.env.taskRange.toString();

// 检查是否是一个合法的文件，并可读
function isFile(path){
    try{
        fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
        return true
    }catch(e){
        return false
    }
}
// 检查是否是一个函数
function isFunction(obj){
    return Object.prototype.toString.call(obj)==='[object Function]'
}
// try{}catch(e){}只针对当前页面....
try {
    let task = path.join(__dirname,taskPath,taskFile);
    // 是否可以找到当前的这个文件
    if(isFile(task)){
        let task_func = require(task)[taskName];
        // 判断是一个正常的函数
        if(isFunction(task_func)){
            const job = new CronJob(taskRange, task_func);
            job.start();
        }else{
            console.log("不是一个正常的函数....");
            process.exit(0);
        }
    }else{
        console.log("文件路径错误...");
        process.exit(0);
    } 
}catch(e){
    // 当前执行函数的时候一旦发生错误,直接退出...
    console.log(e); // 到时候直接推给日志平台...
    process.exit(0);
}


