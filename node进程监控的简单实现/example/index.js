/*
 * @Descripttion: 队列启动进程入口
 * @version: 0.1
 * @Author: lizhiyuan
 * @Date: 2020-11-11 10:05:45
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-17 16:54:15
 */
const forever = require('forever-monitor');
const path = require('path');
const fs = require('fs');
const log4js = require('log4js');
const env = process.env.NODE_ENV || 'development';
const rabbitmq_config = require('./config').rabbitmq_config[env];
const log_config = require('./config').rabbitmq_config[env].log_config;
const taskList = rabbitmq_config.rabbitmq_list;
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
var logger = log4js.getLogger();
var tasks = [];
// 检查是否是一个合法的文件，并可读
function isFile(path){
    try{
        fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
        return true
    }catch(e){
        logger.info(e.toString());
        return false
    }
}
for(let i=0;i<taskList.length;i++){
    if(isFile(path.join(__dirname,taskList[i].path,taskList[i].file))){
        tasks[i] = new (forever.Monitor)(path.join(__dirname,taskList[i].path,taskList[i].file), {
            "max": taskList[i].max, // 重启的次数
            "silent": taskList[i].silent, // 是否关闭子进程的输出到父进程,true为默认
            'killTree': taskList[i].killTree,           // 关闭当前进程的时候是否杀死子进程
            'minUptime':taskList[i].minUptime, // 该进程必须启动的最短时间，否则则永远不启动
            'spinSleepTime':taskList[i].spinSleepTime, // 进程重启的时间间隔
        })
        // 当前子进程退出的时候触发
        tasks[i].on('exit', function (forever) {
            logger.info(`${taskList[i].file}任务退出`)
        });
        // 当前子进程发生错误的时候触发
        tasks[i].on('error',function(err){
            logger.info(`${taskList[i].file}任务发生错误...`)
        })
        // 当前子进程开始的时候
        tasks[i].on('start',function(process,data){
            logger.info(`${taskList[i].file}任务开始...`)
        })
        // 当前子进程停止的时候
        tasks[i].on("stop",function(process){
            logger.info(`${taskList[i].file}任务停止...`)
        })
        // 当前子进程重启的时候
        tasks[i].on('restart',function(forever){
            logger.info(`${taskList[i].file}任务重启启动了...`)
        })
        // 当前子进程有输出的时候
        tasks[i].on('stdout',function(data){
            // 到时候直接输出到logger中去....
        })
        // 当前子进程有输出错误的时候
        tasks[i].on('stderr',function(data){
            // 到时候直接输出到Logger中去....
        })
        tasks[i].start();
    }
}