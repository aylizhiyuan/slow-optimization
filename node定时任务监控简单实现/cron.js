/*
 * @Descripttion: 使用cron模块的定时任务
 * @version: 
 * @Author: lizhiyuan
 * @Date: 2020-11-10 10:13:55
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-12-17 15:32:58
 */
// 定时任务的日志配置文件
const log4js = require("log4js");
const env = process.env.NODE_ENV || 'development';
const log_config = require('./config').cron_config[env].log_config;


// 日志模块的JSON输出格式的设置,可自定内容添加
log4js.addLayout('json', config => function (logEvent) {
    return JSON.stringify(logEvent) + config.separator;
});
// 日志配置信息
log4js.configure({
    appenders: {
        // 作为本地输出
        local_out:{
             type: 'stdout'
        },  
        // 线上输出
        everyday_file:{ 
            type:"dateFile",
            filename:log_config.filename,
            layout: { type: 'json', separator: ',' }
        },
    },
    categories: {
        default:{ appenders: log_config.category, level: log_config.level,enableCallStack:log_config.enableCallStack},
    }
});
const CronJob = require('cron').CronJob;
const path = require('path');
const fs = require('fs');
const taskPath = process.env.taskPath.toString();
const taskFile = process.env.taskFile.toString();
const taskName = process.env.taskName.toString();
const taskRange = process.env.taskRange.toString();
const logger = log4js.getLogger();
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
    return Object.prototype.toString.call(obj) === '[object Function]'
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
            logger.error(`${task}文件中存在有问题的函数`);
            process.exit(0);
        }
    }else{
        logger.error(`${task}不是一个合格的文件路径`);
        process.exit(0);
    } 
}catch(e){
    // 当前执行函数的时候一旦发生错误,直接退出...
    logger.error("进程失败" + e);
    process.exit(0);
}