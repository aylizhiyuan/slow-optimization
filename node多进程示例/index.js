/*
 * @Author: lizhiyuan
 * @Date: 2020-11-19 15:38:33
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-20 16:55:15
 */
var workerFarm = require('./lib/index.js')
  , workers    = workerFarm(require.resolve('./child'))
  , ret        = 0

for (var i = 0; i < 10; i++) {
  // 传递给子进程的参数以及回调
  workers('#' + i + ' FOO', function (err, outp) {
    console.log(outp)
    if (++ret == 10)
      workerFarm.end(workers)
  })
}