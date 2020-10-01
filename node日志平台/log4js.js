const log4js = require("log4js");
const express = require("express");
const fs = require('fs');
const { readSync } = require("fs");
const { prependOnceListener } = require("process");
log4js.addLayout('json', config => function (logEvent) {
  console.log(logEvent);
  return JSON.stringify(logEvent) + config.separator;
});
log4js.configure({
  //输出信息
  appenders: { 
    error:{ 
      type:"file",
      filename:"error.log",
      layout: { type: 'json', separator: ',' }
    },
    info:{
      type:"file",
      filename:"info.log",
      // layout:{type:"pattern",pattern: "%d{yyyy/MM/dd-hh:mm:ss} %p %f{1}:%l:%o %m%n"}
      layout: { type: 'json', separator: ',' }
    }
  },
  // 输出的配置
  categories: { 
    // 高于info级别的日志都会被记录下来,并且会使用调用堆栈在事件中生成行号和文件名
    default:{ appenders: ["error"], level: "error",enableCallStack:true},
    myError:{ appenders: ["error"], level: "error",enableCallStack:true},
    myInfo:{ appenders: ["info"], level: "debug" ,enableCallStack:true}
  },
  
  // 如果使用的pm2进程的话，需要设置该设置,并安装pm2的模块pm2 install pm2-intercom
  pm2:true
});

const logger = log4js.getLogger('myError');
let app = express();
app.get('/',function(req,res){
    // 关于程序报错和调试信息使用logger来记录
    // 1.推送给http
    // 2.记录在.log日志中
    // 3.直接使用pm2中的app-out.log，但是无法固定格式
    // 进程中的运行时报错pm2 记录,默认的地址是.pm2/logs/app-error.log
    // var obj = {name:"sdfsdf",age:323,text:{firstname:"12",lastname:"sdfsdf"}}
    // logger.debug("打印内容..",obj);
    try{
     var people =  people.findById('test');
    }catch(e){
      logger.error('错误的对象'+ e); // 妈的，原来是这么玩儿的...草你吗的
      res.end("hello world");
    }
    // res.end("hello world");
})
app.listen(3000,function(){
  console.log("server is running....");
})