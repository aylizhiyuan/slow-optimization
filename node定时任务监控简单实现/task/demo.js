/*
 * @Author: lizhiyuan
 * @Date: 2020-10-27 14:26:59
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-28 11:07:12
 */
function task1(){
    try{
        console.log("第一个定时任务...")
    }catch(e){
        // 保证报错的进程直接退出
        process.exit(0);
    }
}
function task2(){
    try{
       console.log("第二个定时任务...")
       setTimeout(function(){
           throw new Error("第二个定时任务失败...")
       },2000)
    }catch(e){
        // 保证报错的进程直接退出
        process.exit(0);
    }
}
module.exports.task1 = task1
module.exports.task2 = task2