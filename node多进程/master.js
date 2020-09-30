// 默认情况下,node进程退出的情况
// 1. 程序自动执行完毕后退出
// 2. 抛出异常后退出
// 3. process.exit(1)主动调用退出
// 所以，纵观所述的话，任何程序其实都是最终是要关闭的.....
// 在父子进程中也是一样，所有的父进程都会默认等待子进程结束后结束....
// 子进程如果失败了,退出后父进程执行完毕后退出....不存在问题
// 父进程如果失败了,提前结束了,子进程就变成了孤儿进程...
var fork = require('child_process').fork;
var process = require('process');
var p = fork('worker.js');
process.on("exit",function(){
    // 这里想办法把子进程杀死就可以了....
    process.kill(p.pid,"SIGKILL");
    console.log("父进程退出...");
})
console.log(process.pid,p.pid);
// throw new Error("错误的代码...."); // 父进程的失败会让子进程直接常驻内存了...








