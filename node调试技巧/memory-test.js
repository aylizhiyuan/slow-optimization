/*
 * @Author: lizhiyuan
 * @Date: 2020-12-30 17:57:21
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-12-30 18:00:21
 */
// 测试内存
var a  = 10; // 该内存只有在进程退出的时候才会销毁

(function(){
    var a = 10; // 函数执行完毕后销毁掉
})()


var bigArray = [];
bigArray = null; // 使用完毕之后销毁(主要针对全局的,函数内的可忽略不计,gc会自动回收的)





