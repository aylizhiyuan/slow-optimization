/*
 * @Author: lizhiyuan
 * @Date: 2020-11-19 15:38:46
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-20 18:23:51
 */
module.exports = function (inp, callback) {
    // inp是worker主进程传递给子进程的参数
    // 所有的子进程中都会有一个callback
    // 这个callback是为了通过process.send传递给父进程...
    callback(null, inp + ' BAR (' + process.pid + ')')
}