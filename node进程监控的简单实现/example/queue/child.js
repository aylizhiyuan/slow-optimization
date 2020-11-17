/*
 * @Author: lizhiyuan
 * @Date: 2020-10-23 17:39:21
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-17 16:50:07
 */
const log4js = require('log4js');
const logger = log4js.getLogger();
setInterval(function(){
    logger.info("任务一每秒运行一次...")
},1000)