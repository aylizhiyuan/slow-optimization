/*
 * @Author: lizhiyuan
 * @Date: 2020-09-21 10:37:06
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-29 17:21:21
 */
module.exports = {
    apps:[{
        name:"app",
        script:"./log4js.js",
        env:{
            NODE_ENV:"development"
        },
        exec_mode:"cluster",
        instances:4,
        // out_file 这个是pm2打印出来的info和error信息
        // error_file 这是pm2启动,程序报错的信息
        merge_logs:true, //合并所有的日志文件:q
    }]
}