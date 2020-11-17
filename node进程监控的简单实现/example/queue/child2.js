/*
 * @Author: lizhiyuan
 * @Date: 2020-10-24 15:24:06
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-17 16:49:46
 */
const log4js = require('log4js');
const logger = log4js.getLogger();
setInterval(function(){
    logger.info("任务二每秒运行一次...")
},1000)