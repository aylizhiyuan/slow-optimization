/*
 * @Author: lizhiyuan
 * @Date: 2020-10-27 14:26:59
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2021-01-07 18:32:38
 */
// 定时任务的输出规范
const log4js = require('log4js'); //调用log4js模块
const logger = log4js.getLogger(); // 调用getLogger API
var num = 0;
function cron1(){
    var obj = {name:'lzy'};
    
    // logger.info(obj);
    // 模拟一个比较复杂超时的任务...
    // 实践证明会排队,等待上一个任务执行完毕后,再执行下一个...
    // 同一时间只能有一个任务在执行.....
    console.time("耗时时间");
    for(var i=0;i<10000000000;i++){
        
    }
    console.timeEnd("耗时时间");
    console.log("OK,任务结束了....");
    // 该任务一旦失败直接该进程就直接退出了...
    // setTimeout(function(){
    //     throw new Error("我的错误...");
    // },3000)
}
function cron2(){
    // logger.info('打印第二个任务...') // 调用打印
}
module.exports.cron1 = cron1
module.exports.cron2 = cron2