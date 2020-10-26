  var forever = require('forever-monitor');
  var path = require('path');
  var child = new (forever.Monitor)(path.join(__dirname,'child.js'), {
    "uid":'you-UID', // 该进程的uid号码
    "pidFile":"path/to/a.pid", // 放置该进程信息的pid路径
    "max": 10, // 重启的次数
    "silent": true, // 是否关闭子进程的输出到父进程,true为默认
    'killTree': true,           // 关闭当前进程的时候是否杀死子进程
    'minUptime':2000, // 该进程必须启动的最短时间，否则则永远不启动
    'spinSleepTime':10000, // 进程重启的时间间隔
  });
  // 当前子进程退出的时候触发
  child.on('exit', function (forever) {
    console.log('任务1退出了.... ');
  });
  // 当前子进程发生错误的时候触发
  child.on('error',function(err){
    console.log("任务1发生错误了.... ")
  })
  // 当前子进程开始的时候
  child.on('start',function(process,data){
    console.log('任务1开始运行了... ')
  })
  // 当前子进程停止的时候
  child.on("stop",function(process){
    console.log('任务1已经停止运行了.... ')
  })
  // 当前子进程重启的时候
  child.on('restart',function(forever){
    console.log("任务1正在尝试重启中... ")
  })
  // 当前子进程有输出的时候
  child.on('stdout',function(data){
    console.log("任务1正在工作... ")
  })
  // 当前子进程有输出错误的时候
  child.on('stderr',function(data){
    // console.log('任务1正在输出报错信息... ')
  })
  child.start();
  var child2 = new (forever.Monitor)(path.join(__dirname,'child2.js'), {
    "uid":'you-UID', // 该进程的uid号码
    "pidFile":"path/to/a.pid", // 放置该进程信息的pid路径
    "max": 10, // 重启的次数
    "silent": true, // 是否关闭子进程的输出到父进程,true为默认
    'killTree': true,           // 关闭当前进程的时候是否杀死子进程
    'minUptime':2000, // 该进程必须启动的最短时间，否则则永远不启动
    'spinSleepTime':1000, // 进程重启的时间间隔
  });
  // 当前子进程退出的时候触发
  child2.on('exit', function (forever) {
    console.log('任务2退出了...');
  });
  // 当前子进程发生错误的时候触发
  child2.on('error',function(err){
    console.log("任务2发生错误了... ")
  })
  // 当前子进程开始的时候
  child2.on('start',function(process,data){
    console.log('任务2开始启动了...')
  })
  // 当前子进程停止的时候
  child2.on("stop",function(process){
    console.log('任务2停止运行了...')
  })
  // 当前子进程重启的时候
  child2.on('restart',function(forever){
    console.log("任务2正在尝试重启.... ")
  })
  // 当前子进程有输出的时候
  child2.on('stdout',function(data){
    console.log("任务2正在工作中... ")
  })
  // 当前子进程有输出错误的时候
  child2.on('stderr',function(data){
    // console.log('任务2正在输出错误信息....')
  })
  child2.start();
