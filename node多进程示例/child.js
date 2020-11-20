/*
 * @Author: lizhiyuan
 * @Date: 2020-11-19 15:38:46
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-20 16:56:54
 */
module.exports = function (inp, callback) {
    // inp是worker主进程传递给子进程的参数
    // callback ....
    callback(null, inp + ' BAR (' + process.pid + ')')
}