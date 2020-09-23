//测试进程cpu标高
var crypto = require('crypto');
function hash(password){
    var salt = crypto.randomBytes(128).toString('base64');
    var hash = crypto.pbkdf2Sync(password,salt,10000,64,'sha512');
    return hash
}
console.time("pbkdf2Sync");
for(var i = 0; i < 100; i++) {
    hash('random_password');
}
console.timeEnd('pbkdf2Sync');

// $ node --prof app # 生成 isolate-0x103000000-v8.log
// $ node --prof-process --preprocess isolate-0x103000000-v8.log > v8.json # 格式化成 JSON 文件
// $ git clone https://github.com/v8/v8.git # 克隆 v8 仓库
// $ open v8/tools/profview/index.html # 打开 V8 profiling log processor
// 注意需要在node高版本下进行
