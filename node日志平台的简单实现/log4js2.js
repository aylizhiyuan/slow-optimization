/*
 * @Author: lizhiyuan
 * @Date: 2020-10-22 17:05:14
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-29 12:03:57
 */
// 容器化单进程部署方式
const log4js = require("log4js");
const express = require("express");
const fs = require('fs');
log4js.addLayout('json', config => function (logEvent) {
  return JSON.stringify(logEvent) + config.separator;
});
log4js.configure({
  //定义输出类型
  appenders: { 
    out:{ 
      type:"file",
      filename:"app.log",
      layout: { type: 'json', separator: ',' }
    },
  },
  // 输出的配置
  categories: { 
    // 高于info级别的日志都会被记录下来,并且会使用调用堆栈在事件中生成行号和文件名
    default:{ appenders: ["out"], level: "debug",enableCallStack:true},
  },
  
  // 如果使用的pm2进程的话，需要设置该设置,并安装pm2的模块pm2 install pm2-intercom
  // pm2:true
});

const logger = log4js.getLogger();
let app = express();
app.get('/',function(req,res){
    // 关于程序报错和调试信息使用logger来记录
    // 1.推送给http
    // 2.记录在.log日志中
    // 3.直接使用pm2中的app-out.log，但是无法固定格式
    // 进程中的运行时报错pm2 记录,默认的地址是.pm2/logs/app-error.log
    var obj = {name:"sdfsdf",age:323,text:{firstname:"12",lastname:"sdfsdf"}}
    logger.info("打印内容..",obj);
    try{
     var people =  people.findById('test');
    }catch(e){

      logger.error('错误的对象'+ e); // 妈的，原来是这么玩儿的..
      res.end("hello world");
    }
    // res.end("hello world");
})
app.listen(3000,function(){
  console.log("server is running....");
})