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

## 5. CDN使用规范

泰山系统的cdn走的是网宿科技的cdn,这里配置了只要是访问www-cache.zhisiyun.com的域名都会走缓存,如果假设你的js文件需要被缓存的话可以加上这个域名,一般我们会对那些改动频率较少的加上这个域名

假设用户第一次访问的时候，没有发现有这个缓存的话，会直接回源访问我们本地的服务器，并将静态的资源缓存下来,下次访问的时候就直接走缓存了....

理论上,需要主动加上www-cache.zhisiyun.com域名的资源:

- jquery的各种插件/UI插件/组件
- 外部加载的框架/类库/图片/文字/媒体资源
- css文件

不需要主动加上www.cache.zhisiyun.com域名的资源:

- 修改频率较高的js文件,业务逻辑文件

但其实即便是www.zhisiyun.com的服务器访问也会走cdn,会走一条比较高的链路，但是资源不会被缓存,只不过速度会快一些



```css
link(href='#{cdn_domain_name}/assets/plugins/bootstrap/css/bootstrap.min.css', rel='stylesheet', type='text/css')
link(href='#{cdn_domain_name}/assets/plugins/bootstrap/css/bootstrap-responsive.min.css', rel='stylesheet', type='text/css')
link(href='#{cdn_domain_name}/assets/plugins/font-awesome/css/font-awesome.min.css', rel='stylesheet', type='text/css')
link(href='#{cdn_domain_name}/assets/css/style-metro.css', rel='stylesheet', type='text/css')
```

```js
script(src='#{cdn_domain_name}/assets/plugins/jquery-3.3.1.min.js', type='text/javascript')
script(src='#{cdn_domain_name}/assets/plugins/jquery-migrate-3.0.1.min.js', type='text/javascript')
script(src='#{cdn_domain_name}/assets/plugins/bootstrap/js/bootstrap.min.js', type='text/javascript')
```

这里的静态资源已经被nginx重新定位了,看下目前的配置信息就知道了

```
location ^~ /pagejs/ { root /var/data/zhisiyun/public/; }
location ^~ /js/ { root /var/data/zhisiyun/public/; }
location ^~ /css/ { root /var/data/zhisiyun/public/; }
location ^~ /img/ { root /var/data/zhisiyun/public/; }
location ^~ /download/ { root /var/data/zhisiyun/public/; }
location ^~ /enneagram-report/ { root /var/data/zhisiyun/public/; }
location ^~ /mbti-report/ { root /var/data/zhisiyun/public/; }
location ^~ /apps/ { root /var/data/zhisiyun/public/; }
location ^~ /help/ { root /var/data/zhisiyun/public/; }
location ^~ /assets/ { root /var/data/zhisiyun/client/; }
location ^~ /bower_components/ { root /var/data/zhisiyun/client/; }
location ^~ /m/ { root /var/data/zhisiyun/client/; }
location / { proxy_pass http://ensure/; }
```

不需要被缓存的文件可以参考下面的写法(直接走本地服务器的相对路径访问就可以了):

```js
script(src='#{path_js_page}/ltyle/js-part/dtable.js')
// 不再推荐使用furl这种(旧方式)
script(src=furl('#{path_js_page}/ltyle/js-part/defined.js'))
```

为了避免被缓存，可以在js文件后面加入动态参数，防止缓存
```css
// 以当前发布的日期为准
link(href='#{cdn_domain_name}/assets/css/iconfont1.css?v=20180410', rel='stylesheet', type='text/css') 
```


## 6. 域名使用规范

- css文件中不允许使用绝对路径（域名）加载图片

```
// 错误
background: url('https://www-cache.zhisiyun.com/img/no-video.png') #f2f2f2 no-repeat center;

// 正确
background: url('../../../public/img/no-video.png') #f2f2f2 no-repeat center;
```

- jade文件中加载任何外部的资源，走CDN的写法

```
// 图片
img.img_five(src='#{cdn_domain_name}/assets/img/500.png')

// css文件
 link(href='#{cdn_domain_name}/assets/css/pages/error.css', rel='stylesheet', type='text/css')

// js文件
script(src='#{cdn_domain_name}/assets/plugins/jquery-3.3.1.min.js', type='text/javascript')


// 不走CDN的写法,针对变动较大的文件,统一的放在pagejs中去
script(type="text/javascript", src="#{path_js_page}/wxapp.001_04.js?v=20200331")

```

- 后端js文件中的写法

```
// *****不允许的写法**** 直接将域名写死,导致迁移的时候会非常的麻烦
var url = 'http://www.zhisiyun.com/wxapp/001/react_face_emp';

// 正确的写法,从config.json配置文件中读入域名信息
var url = website_domain_name + '/wxapp/001/react_face_emp';
```

- 前端js文件中的写法

```
前端使用到当前域名的js文件中不能直接写死某域名，使用location.host动态获取当前的域名信息后使用

// 实例

host: window.location.host ? window.location.host : 'www.zhisiyun.com'

// 理论上不带协议

```

## 7.日志输出规范

1.  主进程日志输出规范

主进程日志的输出配置在config.json中,默认本地development中，直接将logger的信息打印到控制台中去,生产环境下,每天会产生一个固定的文件输出

```
// 配置文件信息 -config.json
"log_config":{
    "development":{
        "filename":"",
        "level":"debug", // trace < debug < info < error < warn < error
        "category":["local_out"],
        "enableCallStack":true
    },
    "production":{
        "filename":"/var/data/logs/app.log",
        "level":"debug", // 默认输出的级别为debug级别以上
        "category":["everyday_file"],
        "enableCallStack":true
    }
},
```

调用的时候可直接在路由处理文件中调用log4js模块

```js

const log4js = require('log4js');
const logger = log4js.getLogger();

// 打印数据
var obj = {name:"sdfsdf",age:323,text:{firstname:"12",lastname:"sdfsdf"}}
logger.info("打印内容..",obj);

// 打印错误
try{
    var people =  people.findById('test');
}catch(e){
    logger.error('错误的对象'+ e); // 错误对象转化为字符串打印输出
    res.end("hello world");
}
```

2.  队列日志输出规范

每个队列都需要独立的输出日志文件,需要每个人输出到/var/data/logs中去


3.  定时任务输出规范

```js
// 定时任务的输出规范
const log4js = require('log4js'); //调用log4js模块
const logger = log4js.getLogger(); // 调用getLogger API
function cron1(){
    logger.info('打印第一个任务...'); // 调用打印
}
function cron2(){
    logger.info('打印第二个任务...') // 调用打印
}
module.exports.cron1 = cron1
module.exports.cron2 = cron2
```

## 8.队列创建规范代码









