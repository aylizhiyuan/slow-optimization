//测试接口CPU标高
var fs = require('fs');
var crypto = require('crypto');
var bluebird = require('bluebird');
var profiler = require('v8-profiler');
var express = require('express');
var app = express();

//CPU密集型操作的函数
app.get('/encrypt',function(req,res){
    var password = req.query.password || 'test';
    var salt = crypto.randomBytes(128).toString('base64');
    var encryptedPassword = crypto.pbkdf2Sync(password,salt,10000,64,'sha512').toString('hex');
    res.status(200).send(encryptedPassword);
})
//此操作是为了收集30s的v8 log然后dump到一个文件中去
app.get('/cpuprofile',function(req,res){
    //开始快照
    profiler.startProfiling("CPU profile");
    //30秒的快照开始
    bluebird.delay(30000).then(function(){
        var profile = profiler.stopProfiling()
   profile.export()
     .pipe(fs.createWriteStream(`cpuprofile-${Date.now()}.cpuprofile`))
     .on('finish', () => profile.delete())
    });
})
app.listen(3000,function(){
    console.log("测试cpu性能服务器启动成功....")
})

//1. 启动node cpu-v8-profiler.js服务器
//2. curl localhost:3000/cpuprofile
//3. ab -c 20 -n 2000 "http://localhost:3000/encrypt?password=123456"
//4. 打开检查---> devtools ---> more tools --> javascript profile ---> load

//查看占用最多CPU性能的函数,也可以通过火焰图查看
// npm i flamegraph -g 
// flamegraph -t cpuprofile -f cpuprofile-xxx.cpuprofile -o cpuprofile.svg


// 通过v8-analytics 可以很快速的看到CPU的使用情况
// npm i v8-analytics -g 
// va timeout cpuprofile-xxx.cpuprofile 200 --only

