/*
 * @Author: lizhiyuan
 * @Date: 2020-11-20 16:30:48
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-20 17:59:23
 */
const childProcess = require('child_process');
const childModule = require.resolve('./child/index');
function fork(forkModule,workerOptions){
    // 主进程fork的时候
    let filterArgs = process.execArgv.filter(function(v){
        return !(/^--(debug|inspect)/).test(v)
    })
    let options = Object.assign({
        execArgv:filterArgs,
        env:process.env,
        cwd : process.cwd()
    },workerOptions)
    let child = childProcess.fork(childModule,process.argv,options)
    child.on('error',function(){

    })
    // 主进程向子进程发送消息，将需要fork的信息发送给子进程
    child.send({ owner: 'farm', module: forkModule })
    return {
        send : child.send.bind(child),
        child : child
    }
}

module.exports = fork
