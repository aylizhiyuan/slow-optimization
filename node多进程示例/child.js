/*
 * @Author: lizhiyuan
 * @Date: 2020-11-19 15:38:46
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-19 15:38:57
 */
module.exports = function (inp, callback) {
    callback(null, inp + ' BAR (' + process.pid + ')')
}