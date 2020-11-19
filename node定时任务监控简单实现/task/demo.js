/*
 * @Author: lizhiyuan
 * @Date: 2020-10-27 14:26:59
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-19 11:39:08
 */
// 定时任务的输出规范
const log4js = require('log4js'); //调用log4js模块
const logger = log4js.getLogger(); // 调用getLogger API
function cron1(){
    var obj = {name:'lzy'};
    logger.info(obj);
    logger.info('打印第一个任务...'); // 调用打印
}
function cron2(){
    logger.info('打印第二个任务...') // 调用打印
}
module.exports.cron1 = cron1
module.exports.cron2 = cron2