/*
 * @Author: lizhiyuan
 * @Date: 2020-10-23 17:39:21
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-12-18 15:03:46
 */
const log4js = require('log4js');
const env = process.env.NODE_ENV || 'development'
const log_config = require('../config.json').rabbitmq_config[env].log_config;
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

const logger = log4js.getLogger();
var fork = require('child_process').fork;
var p = fork('./queue/worker.js');
setInterval(function(){
    logger.info('第一个任务开始工作...');
},1000)