/*
 * @Author: lizhiyuan
 * @Date: 2020-11-20 16:31:03
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-20 18:23:15
 */
let $module
// 这个应该是fork出来的子进程

function handle(data){
    // 处理主进程发来的消息
    let idx = data.idx;
    let child = data.child;
    let method = data.method;
    let args = data.args;
    let callback = function(){
        let _args = Array.prototype.slice.call(arguments);
        if(_args[0] instanceof Error){
            let e = _args[0]
            _args[0] = {
                '$error':'$error',
                'type':e.constructor.name,
                'message':e.message,
                'stack':e.stack
            }
            Object.keys(e).forEach(function(key){
                _args[0][key] = e[key]
            })
        }
        // 将子进程函数中在callback中传递的参数发送给主进程
        process.send({owner:'farm',idx:idx,child:child,args:_args})
    }
    let exec;
    if(method == null && typeof $module == 'function'){
        exec = $module; //只有一个函数的情况下
    }else if(typeof $module[method] == 'function'){
        exec = $module[method]
    }
    if(!exec) return console.error("NO SUCH METHOD:",method);
    // 子进程函数中会有一个callback回调函数,回调函数会给主进程发送消息...
    exec.apply(null,args.concat([callback]));
}
process.on('message',function(data){
    if(data.owner !== 'farm'){
        return;
    }
    if(!$module) return $module = require(data.module);
    if(data.event == 'die') return process.exit(0);
    handle(data);
})
