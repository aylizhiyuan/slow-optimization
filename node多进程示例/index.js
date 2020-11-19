/*
 * @Author: lizhiyuan
 * @Date: 2020-11-19 15:38:33
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-11-19 15:39:49
 */
var workerFarm = require('./lib/index.js')
  , workers    = workerFarm(require.resolve('./child'))
  , ret        = 0

for (var i = 0; i < 10; i++) {
  workers('#' + i + ' FOO', function (err, outp) {
    console.log(outp)
    if (++ret == 10)
      workerFarm.end(workers)
  })
}