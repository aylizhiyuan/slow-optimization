/*
 * @Author: lizhiyuan
 * @Date: 2020-12-11 14:04:30
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2021-01-07 14:48:57
 */

var net = require('net');
var idGenerator = function(a){
	return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).
		replace(/[018]/g, idGenerator);
};
var log = {
    e:function(){
        // 根据参数创建一个新的数组
        var args = new Array(arguments.length);
        // 将所有的参数都放入数组中
        for(var ai=0,al=arguments.length;ai < al;++ai){
            args[ai] = arguments[ai];
        }
        // 将数组打印出来
        console.log(args);
    }
}
var descrCmd = '__D';
var resultCmd = '__R';
var errorCmd = '__E';
// 返回\n的Unicode码
var newLineCode = '\n'.charCodeAt(0);

exports = module.exports = LightRPC

/**
 * @description: 
 * @param {object} wrapper 函数对象,服务器提供的函数服务
 * @param {object} logger 打印对象
 * @return {object} 返回一个net连接的实例对象,调用listen方法监听端口
 */
function LightRPC(wrapper,logger){
    if(!(this instanceof LightRPC)){
        return new LightRPC(wrapper,logger);
    }
    log = logger || log;
    this.wrapper = wrapper;
    this.description = {};
    this.callbacks = {};
    // 遍历对象,将函数
    for(var p in wrapper){
        // p = combine / multiply
        this.description[p] = {}
    }
    // 53 + '\n' + {"command":"__D","data":{"combine":{},"multiply":{}}}
    this.descrStr = command(descrCmd,this.description);
    return this;
}   
/**
 * @description: 客户端连接TCP服务器,callback中调用方法发送消息给服务器
 * @param {string}
 * @param {string} 
 * @return {*}
 */
LightRPC.prototype.connect = function(port,host,callback){
    if(!callback){
        callback = host;
        host = 'localhost';
    }
    // 建立一个TCP连接
    var connection = net.createConnection(port,host);
    var self = this;
    // 保持长连接
    connection.setKeepAlive(true);
    // 连接到服务器的时候,将"__D"传递给服务器
    connection.on("connect",function(){
        connection.write(command(descrCmd));
    })
    // 客户端处理命令
    var commandsCallback = function(cmd){
        // 这里已经拿到了从服务器中接受到的结果后
        // 调用对应的callbacks,结果传递给它
        if(cmd.command === resultCmd){
            if(self.callbacks[cmd.data.id]){
                self.callbacks[cmd.data.id].apply(this,cmd.data.args)
                delete self.callbacks[cmd.data.id];
            }
        }else if(cmd.command === errorCmd){
            if(self.callbacks[cmd.data.id]){
                self.callbacks[cmd.data.id].call(this,cmd.data.args);
                delete self.callbacks[cmd.data.id];
            }
        }else if(cmd.command === descrCmd){
            // 客户端接收到服务器提供的方法后,进行的操作
            var remoteObj = {};
            for(var p in cmd.data){
                // 遍历data中服务器提供的方法
                remoteObj[p] = getRemoteCallFunction(p, self.callbacks, connection);
            }
            // console.log(remoteObj);
            callback(remoteObj,connection);
        }
    }
    var lengthObj = {
        bufferBytes:undefined,
        getLength:true,
        length:-1
    }
    // 服务器发送来消息的时候,调用,处理服务器的消息
    connection.on('data',getOnDataFn(commandsCallback,lengthObj))
    connection.on('error', function(err){
		log.e('CONNECTION_DAMN_ERROR', err);
	});

	connection.on('timeout', function(){
		log.e('RPC connection timeout');
	});

	connection.on('end', function(){
		log.e('RPC connection other side send end event');
	});
    
}

/**
 * @description: 服务器建立,监听具体的端口,接收客户端的数据,处理数据后,将结果返回给客户端
 * @param {*}
 * @return {*}
 */
LightRPC.prototype.listen = function(port){
    this.getServer();
    this.server.listen(port);
}

/**
 * @description:  建立TCP服务器
 * @param {*}
 * @return {*}
 */
LightRPC.prototype.getServer = function(){
    var self = this;
    var server = net.createServer(function(c){
        // 服务器处理命令
        var commandsCallback = function(cmd){
            // 当服务器接收到{command:'__D'}命令的时候
            if(cmd.command === descrCmd){
                // console.log(self.descrStr);
                // 将command:__D,data:{}写给客户端,告诉客户端服务器提供多少方法
                c.write(self.descrStr);
            }else if(!self.wrapper[cmd.command]){
                c.write(command('error',{code:"UNKNOWN_COMMAND"}))
            }else{
                // 接收到客户端要调取的方法以及参数
                // {"command":"combine","data":{"id":"e7be5c7a-4ff0-4d6f-9394-2ed70c07a374","args":[4,5]}}
                var args = cmd.data.args;
                // 将服务器中的callback函数封装
				args.push(getSendCommandBackFunction(c, cmd.data.id));

				try{
                    // 调用服务器的combine方法,并将参数传递给它
					self.wrapper[cmd.command].apply({}, args);
				}
				catch(err){
					log.e(err);
					var resultCommand = command(errorCmd, {id: cmd.data.id, err: err});
					c.write(resultCommand);
				}
            }
        }
        var lengthObj = {
            bufferBytes:undefined,
            getLength:true,
            length:-1
        };
        c.on('data',getOnDataFn(commandsCallback,lengthObj));
        c.on('error',function(exception){
            log.e(exception);
        })
    })
    this.server = server;
    return server

}
/**
 * @description: 将当前的服务器连接关闭 
 * @param {*}
 * @return {*}
 */
LightRPC.prototype.close = function(){
    this.server.close();
}
LightRPC.connect = function(){
	var rpc = new LightRPC();
	return rpc.connect.apply(rpc, arguments);
};
/**
 * @description: 将执行的命令和参数转化为字符串
 * @param {string} name 命令名称
 * @param {string} data 数据
 * @return {string} 字符串,前面是字符串的字节长度 + 字符串
 */
function command(name,data){
    var cmd = {
        command:name,
        data:data
    };
    // 一定注意,对象想转化为二进制流,先转字符串,然后再转二进制流
    var cmdStr = JSON.stringify(cmd);
    // 53 + '\n' + {"command":"__D","data":{"combine":{},"multiply":{}}}
    return Buffer.byteLength(cmdStr) + '\n' + cmdStr
}

/**
 * @description: 返回一个处理函数
 * @param {Function} commandCallback 处理各种命令的函数
 * @param {Object} lengthObj 应该是各种参数把
 * @return {*} 
 */
function getOnDataFn(commandsCallback,lengthObj){
    return function(data){
        // data为接收到的数据字符串
        // console.log(data.toString());
        // 客户端和服务器 除 第一次外的数据传输
        if(lengthObj.bufferBytes && lengthObj.bufferBytes.length > 0){
            var tmpBuff = new Buffer(lengthObj.bufferBytes.length + data.length);
            lengthObj.bufferBytes.copy(tmpBuff,0);
            data.copy(tmpBuff,length.bufferBytes.length);
            lengthObj.bufferBytes = tmpBuff;
        }else{
            // console.log("第一次客户端连接服务器的时候");
            // 服务器接收到了来自客户端的command:__D命令
            // 客户端接收到了来自服务器返回的command:__D,data:{combine:{},multipy:{}}
            lengthObj.bufferBytes = data;
            // console.log(lengthObj.bufferBytes.toString());
        }
        // 第一次服务器的lengthObj = {command:__d}
        // 第一次客户端的lengthObj = {command:__d,data:{combine:{},multipy:{}}}
        var commands = getCommands.call(lengthObj);
        commands.forEach(commandsCallback);
    }
}
/**
 * @description: 客户端接收到服务器的方法后,进行的操作
 * @param {*} cmdName 举例combine,multipy等方法名称
 * @param {*} callbacks callbacks第一次是空的
 * @param {*} connection TCP连接的句柄
 * @return {*}  返回的实际上是一个函数,remote.combine()实际就是这个函数
 */
function getRemoteCallFunction(cmdName,callbacks,connection){
    // 实际就是你调用remote.combine函数的操作
    return function(){
		var id = idGenerator();
        // 将这个remote.combine的回调函数存放到这里来
		if(typeof arguments[arguments.length - 1] === 'function'){
			callbacks[id] = arguments[arguments.length - 1];
		}

        var args = [];
        // 将remote.combine的参数集合放入args中去
		for(var ai = 0, al = arguments.length; ai < al; ++ai){
			if(typeof arguments[ai] !== 'function'){
				args.push(arguments[ai]);
			}
		}
        
        var newCmd = command(cmdName, {id: id, args: args});
        // {"command":"combine","data":{"id":"e7be5c7a-4ff0-4d6f-9394-2ed70c07a374","args":[4,5]}}
        // 发送给服务器,让服务器处理
        // console.log(newCmd);
		connection.write(newCmd);
	};
}
/**
 * @description:  依然是封装回调函数
 * @param {*} connection 连接句柄
 * @param {*} cmdId cmd的ID值
 * @return {*} 实际就是combine(1,3,function(){})里面的回调函数
 */
function getSendCommandBackFunction(connection,cmdId){
    return function(){
		var innerArgs = [];

		for(var ai = 0, al = arguments.length; ai < al; ++ai){
			if(typeof arguments[ai] !== 'function'){
				innerArgs.push(arguments[ai]);
			}
		}

        var resultCommand = command(resultCmd, {id: cmdId, args: innerArgs});
        // {"command":"__R","data":{"id":"0bad1f27-34f5-4e3e-a9e0-1e4f329bf0cb","args":[9]}}
        // console.log(resultCommand);
        // 算出结果后写回给客户端
		connection.write(resultCommand);
	};
}
function getCommands(){
    var commands = [];
    var i = -1;
    var parseCommands = function(){
        if(this.getLength === true){
            // 拿到第一个空格处的索引
			i = getNewlineIndex(this.bufferBytes);
			if(i > -1){
                // 获取命令的长度,就是该字符串的长度
                this.length = Number(this.bufferBytes.slice(0, i).toString());
                // console.log(this.length);
				this.getLength = false;
                // (i + 1) for \n symbol
                // 将命令截取到后直接存放如bufferBytes中
                this.bufferBytes = clearBuffer(this.bufferBytes, i + 1);
                // console.log(this.bufferBytes.toString());
			}
		}

		if(this.bufferBytes && this.bufferBytes.length >= this.length){
			var cmd = this.bufferBytes.slice(0, this.length).toString();
			this.getLength = true;
            // 将命令的对象格式化
			try{
				var parsedCmd = JSON.parse(cmd);
			}
			catch(e){
				log.e('ERROR PARSE');
				log.e(cmd);
				log.e(this.length, this.bufferBytes.toString());
				return;
			}
            // 存入commands数组中
            commands.push(parsedCmd);
            // 将bufferBytes清空
			this.bufferBytes = clearBuffer(this.bufferBytes, this.length);
            
			if(this.bufferBytes && this.bufferBytes.length > 0){
				parseCommands.call(this);
			}
		}
    }
    parseCommands.call(this);
    // console.log('接收到的命令======',commands);
    return commands
}
/**
 * @description: 获取buffer中一行数据的结束索引
 * @param {buffer} buffer 二进制字节数组
 * @return {number} index 索引数值
 */
function getNewlineIndex(buffer){
    if(buffer){
        for(var i=0,l=buffer.length;i<l;++i){
            if(buffer[i] === newLineCode){
                return i;
            }
        }
    }
    return -1;
}
/**
 * @description: 将buffer数组按长度截取
 * @param {buffer} buffer 二进制字节数组
 * @param {string} length 截断长度
 * @return {array} 返回截取的长度的新数组
 */
function clearBuffer(buffer,length){
    if(buffer.length > length){
        return buffer.slice(length);
    }
    return undefined;
}
