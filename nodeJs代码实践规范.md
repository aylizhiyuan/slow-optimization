# nodeJS代码实践规范

## 1. 异步任务规范写法


### ***抛错处理***

推荐的做法是直接将函数包裹在try{}catch{}语句块中，单独的异步任务抛出错误，在外层的catch中

```
let source_relate = async function(req, res) {
    let client = req.user.client._id;
    let people_id = req.user.people._id;
    let people_name = req.user.people.people_name;
    let pf_configs = req.body.pf_configs || [];
    try{
        let new_data = await CusGrowthSourceConfig.insertMany(datas);
        // if判断要考虑null的情况,假设查不出来,或者数据丢失了,需要做兼容性处理
        if(new_data) {
            return res.json({
                code: "OK",
                msg: '保存成功！'
            })
        }else{
            //继续下面的代码逻辑
        }
    }catch(e){
        // 如果不返回错误的话直接打印
        console.error('routes:admin.deduction.js:deduction_toVoid ',error)
        // 如果需要返回错误结果的话直接返回
        return res.json({
            code: "ERR",
            error: e,
            msg: "保存失败!"
        })
    }
}

```

推荐使用 npm i await-to-js --save

```
import to from 'await-to-js';
// If you use CommonJS (i.e NodeJS environment), it should be:
// const to = require('await-to-js').default;

async function asyncTaskWithCb(cb) {
     let err, user, savedTask, notification;

     [ err, user ] = await to(UserModel.findById(1));
     if(!user) return cb('No user found');

     [ err, savedTask ] = await to(TaskModel({userId: user.id, name: 'Demo Task'}));
     if(err) return cb('Error occurred while saving task');

    if(user.notificationsEnabled) {
       [ err ] = await to(NotificationService.sendNotification(user.id, 'Task Created'));
       if(err) return cb('Error while sending notification');
    }

    if(savedTask.assignedUser.id !== user.id) {
       [ err, notification ] = await to(NotificationService.sendNotification(savedTask.assignedUser.id, 'Task was created for you'));
       if(err) return cb('Error while sending notification');
    }

    cb(null, savedTask);
}

async function asyncFunctionWithThrow() {
  const [err, user] = await to(UserModel.findById(1));
  if (!user) throw new Error('User not found');
}
```

### ***多个异步任务***

```
// 可以使用for循环来完成不同的异步任务
for (const item of bm_infos) {
    let bm = await bs_update(list);
    if (!bm) return false;
}

// 建议使用Promise.all方法
async function fetchAndDecode(url, type) {
  let response = await fetch(url);

  let content;

  if(type === 'blob') {
    content = await response.blob();
  } else if(type === 'text') {
    content = await response.text();
  }
  return content;
}
async function displayContent() {
    let coffee = fetchAndDecode('coffee.jpg', 'blob');
    let tea = fetchAndDecode('tea.jpg', 'blob');
    let description = fetchAndDecode('description.txt', 'text');
    let values = await Promise.all([coffee, tea, description]);
}
```


## 2. 开发外网请求示例

***场景说明: 目前使用code-server 开发连接外部网络需要在请求中包含代理信息,并且请求的url 需要在运维处报备开白名单***

### 1.本次新增公共文件 zhisiyun/utils/proxy_util.js

```js
const url = require('url');
const tunnel = require("tunnel");

const http_proxy = process.env.http_proxy;
let agent = null;
if (http_proxy) {
    const parsedProxy = url.parse(http_proxy);
    let proxy = {};
    if (parsedProxy.hostname) { //主机
        proxy.host = parsedProxy.hostname
    };
    if (parsedProxy.port) { //端口
        proxy.port = parsedProxy.port
    };
    if (parsedProxy.auth) { //登录认证
        proxy.proxyAuth = parsedProxy.auth
    };
    agent = tunnel.httpOverHttp({
        proxy: proxy
    });
};


const beforeRequest  = function(options) {
    options.agent = agent;
};

module.exports  = {
    beforeRequest,
    agent
}
```



### 1. request, urllib  等库 可以直接传入agent 对象
```js
const urllib = require('urllib');
const proxy_utils = require('./utils/proxy_util')

function test() {
    const url = "http://www.baidu.com"
    const options = {
        method:"GET",
        agent:proxy_utils.agent
    }
    urllib.request(url,options,function(err,response,body){
            console.error(err)
            console.log(body)
    })
}
test()
```
正常返回的结果类似于
```js
{
    statusCode::200
}
```

**ali-oss** 也可以用这种方法 传递 **agent**,当前版本是 **4.11.2**
```js
var store = oss({
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    bucket: bucket,
    region: region,
    agent: proxy_utils.agent
});

```

### 2.  **urllib** 提供 **beforeRequest** 函数
```js
const urllib = require('urllib');
const proxy_utils = require('./utils/proxy_util')

function test() {
    const url = "http://www.baidu.com"
    const options = {
        method:"GET",
        beforeRequest:proxy_utils.beforeRequest
    }
    urllib.request(url,options,function(err,response,body){
            console.error(err)
            console.log(body)
    })
}
test()
```


## 3. 文件注释/函数注释风格规范

每个文件,每个函数都必须有固定的注释风格

koroFileHeader 是一个在vscode中用于生成文件头部注释和函数注释的插件

在vscode配置中搜索关键词可自定义注释的内容

***文件头部注释：Fileheader:custom Made***

```
// 系统默认的设置,这里需要根据自己的情况填写的就是Author以及LastEditors,其余保持不变,将此设置写入自己的setting.json文件中即可

"fileheader.customMade": {
    "Descripttion":"",
    "version":"",
    "Author":"lizhiyuan", // 写自己的名字
    "Date":"Do not edit",
    "LastEditors":"lizhiyuan", // 写自己的名字
    "LastEditTime":"Do not Edit"
}
```

示例

```
/*
 * @Date: 2020-04-22 18:39:42
 * @LastEditors: sunche
 * @LastEditTime: 2020-04-23 10:06:28
 * @FilePath: /zhisiyun_new/queue/rabbit_task_api_send_wx_msg_pri.js
 */
```
> 头部注释的快捷键 crtl+alt+i（window）,ctrl+cmd+i (mac)

***函数注释：Fileheader:cursor Mode***

可将光标放到函数上`function`或者是`函数名称`上,使用快捷键,会自动生成函数注释

```
"fileheader.cursorMode": {
    "description":"",
    "param":"",
    "return":"",
    "example":""
}
```
> 快捷键：ctrl+alt+t (window), ctrl+alt+t(mac) ,如果遇到快捷键失灵的情况，请参考 https://github.com/OBKoro1/koro1FileHeader/issues/5

示例

```
        /**
         * Initializes a newly created cipher.
         *
         * @param {number} xformMode Either the encryption or decryption transormation mode constant.
         * @param {WordArray} key The key.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @example
         *
         *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
        */

```

## 4. 业务代码注释原则

koroFileHeader完成了基本的文件注释和函数注释,其余的注释风格需要按照jsDoc来书写

### 1. 核心重要变量的注释

```
/**
 * @var {object}
 * @desc 变量定义
 * @property {string} json 属性 name 或者 name 属性 用户姓名
 * @property {string} 30   属性 age  或者 age  属性 用户年龄
 */

var userInfo = {
    name: 'json',
    age: '30'
}
```

### 2. 核心常量的注释

```
/**
 * @constant {string}
 * @default #DDD
 * @desc 常量定义
 */
const COLOR_THEME = '#DDD';
```

### 3. 异步代码的注释

涉及到的异步代码需要简单的描述功能,需要用到单行注释

```
        // 停用和删除的数据源配置，成长记录全部删除
        let records = await CusGrowthSourceConfig.find({
            client: client,
            pf_config: {$in:pf_configs},
            status: {$in:['0','2']}
        }).select('_id');
        await GrowthRecordSync.remove({
            client: client,
            type: "pf_table",
            eveid: {$in:_.pluck(records, '_id')}
        })
        // 删除状态数据源配置，数据源配置全部删除
        await CusGrowthSourceConfig.remove({
            client: client,
            pf_config: {$in:pf_configs},
            status: '2',
        });
```






