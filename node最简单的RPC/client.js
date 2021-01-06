/*
 * @Author: lizhiyuan
 * @Date: 2020-12-11 14:04:26
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2021-01-06 11:31:40
 */
var rpc = require('./index.js');
rpc.connect(5556, 'localhost', function(remote, conn){
	remote.combine(4, 5, function(res){
		if(res != 3){
			console.log('ERROR', res);
        }
        console.log('打印计算的结果....',res);
		conn.destroy();
		conn.end();
	});
});