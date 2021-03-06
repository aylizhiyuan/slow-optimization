/*
 * @Author: lizhiyuan
 * @Date: 2020-10-23 19:07:28
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-19 15:26:15
 */
const utile = require('utile');
const common = require('./forever-monitor/common');
exports.kill = common.kill;
exports.checkProcess = common.checkProcess;
// 暴露的Monitor对象
exports.Monitor = require('./forever-monitor/monitor').Monitor;
exports.version = require('./package').version;
exports.start = function(script,options){
    if(!options.uid){
        options.uid = options.uid || utile.randomString(4).replace(/^\-/, '_')
    }
    return exports.Monitor(script,options).start();
}
