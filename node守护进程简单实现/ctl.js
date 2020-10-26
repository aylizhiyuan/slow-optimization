/*
 * @Author: lizhiyuan
 * @Date: 2020-09-25 10:03:24
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-26 17:14:18
 */

// 为了支持监控子进程的运行状态和让子进程独立运行,我们使用spawn

const spawn = require('child_process').spawn;
const subprocess = spawn('node',['app.js'],{
    detached:true,
    stdio:'ignore' // pipe只能通过父进程输出 
});
subprocess.unref();
// 成为守护进程的条件
// 1. 子进程必须和父进程分离 ,及detached= true
// 2. 默认情况下父进程会等待已分离的子进程,调用subprocess.unref()取消等待
// 3. 子进程的IO和父进程的IO不能联系 stdio:ignore



