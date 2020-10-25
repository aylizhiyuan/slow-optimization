const CronJob = require('cron').CronJob;
console.log("开始执行定时任务1....");
// 向子进程发送消息
const job = new CronJob('*/5 * * * * *', function() {
    try{
        const d = new Date();
        console.log(`pid-${process.pid} 每五秒打印一下当前时间任务:`, d);
        // 当前子进程出问题了....
        // throw new ReferenceError("代码级别的错误....");
    }catch(error){
        console.log(error) //后期考虑更好的方式记录错误日志
    }
});
job.start();
// 子进程收到消息的时候的处理...
process.on("message",function(msg){
    console.log(`子进程收到消息: ${msg}`)
})

// 你可以理解为这个是我们无法手动捕获的系统错误,在这里抛出,不会让当前进程杀死....
process.on('uncaughtException', function (err) {
    console.log(`pid-${process.pid} Caught exception: ${err.stack}`);
    // 默认可能process.exit(1)了直接就...
});

// 重点在于子进程要发送数据给主进程




