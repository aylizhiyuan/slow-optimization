/*
 * @Author: lizhiyuan
 * @Date: 2020-12-11 14:04:26
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-12-11 14:12:22
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