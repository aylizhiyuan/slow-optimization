// fork方法可以很方便的进行父子进程之间的通信了...spawn需要设置
// spawn是所有这些方法的底层实现...spawn(node app.js) === fork(app.js)
// spawn的应用场景大多集中在跟操作系统打交道的时候,或者执行一个非node进程...

var child_process = require('child_process');
var express = require('express');

var app = express();

var spawn = child_process.spawn;

var ls = spawn('ls', ['-lh', '/usr'],{
    // 一些参数
    // stdio:'pipe' //父子进程管道相连,子进程的内容流向父进程
    // stdio:'ignore' // 子进程的管道不再连接,直接将子进程的输入输出挂载到/dev/null
    // stdio:'inherit' // 子进程使用父进程的管道,自己没有管道了...
    // stdio: [null, null, null, 'ipc'] // 如果是个数组的话，可以指定pipe/ipc/ignore/inhert/stream任何一个流
})
// 当这个进程的输出有内容的时候将它打印出来
ls.stdout.on('data',function(data){
    console.log(`stdout: ${data}`);
})
// 当这个进程的错误有内容的时候将它打印出来
ls.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});


app.listen(3000,function(){
    console.log("服务器启动成功");
})

