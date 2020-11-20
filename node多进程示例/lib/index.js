/*
 * @Author: lizhiyuan
 * @Date: 2020-11-20 16:30:25
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-20 16:39:33
 */
const Farm = require('./farm');
let farms = [];
// 这是我们暴露的函数
// var workers = workerFarm[require.resolve('./child')]
// 返回一个函数，这个函数是我们启动的进程
function farm(options,path,methods){
    if(typeof options == 'string'){
        methods = path;
        path = options;
        options = {}; // 解决不传递options参数的问题
    }
    let f = new Farm(options,path);
    let api = f.setup(methods);
    farms.push({farm:f,api:api})
    return api // 返回公共的api
}
function end(api,callback){
    for(let i=0;i<farms.length;i++){
        if(farms[i] && farms[i].api === api) return farms[i].farm.end(callback)
        process.nextTick(callback.bind(null,new Error('Worker farm not found !')));
    }
}

module.exports = farm 
module.exports.end = end