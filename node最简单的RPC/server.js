/*
 * @Author: lizhiyuan
 * @Date: 2020-12-11 14:04:21
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-12-11 14:06:41
 */
var light_rpc = require('./index');
var port = 5556;
var rpc = new light_rpc({
    combine:function(a,b,callback){
        callback(a + b);
    },
    multiply:function(t,cb){
        cb(t*2);
    }
})
rpc.listen(port);