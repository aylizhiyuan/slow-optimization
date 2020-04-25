<!--
 * @Date: 2020-04-18 21:04:40
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-04-25 16:36:59
 * @FilePath: /慢路径优化策略/README.md
 -->

# 慢路径优化策略

页面加载时间 + 网络往返时间 + 服务器运行代码 + 数据库查询 = 完整访问的时间

## 1. 页面加载阶段是否有问题

通常我们会遇到很多慢的情况,浏览器慢,网络慢,服务器慢,数据库慢,我们来分析下一个请求的整个过程

一般的web请求都是借助于浏览器(输入url回车)或者代码Ajax实现的,无论怎么说,都是由浏览器给我们将请求发出去

请求的起点在浏览器,终点也在浏览器...

![](https://developers.google.com/web/tools/chrome-devtools/network/imgs/timeline-view-hover.png)

- Queuing 请求等待队列的时间
- Stalled 请求停转的时间
- If applicable: DNS lookup, initial connection, SSL handshake  DNS解析时间/TCP三次握手/SSL握手阶段
- Request sent 发送我们的请求所耗费的时间,通常这个时间是比较短的
- Waiting (Time to first byte (TTFB)) 请求 ----> 服务器 ----> 客户端接收到第一个字节的时间
- Content Download 响应数据下载的时间

**什么情况下请求会排队**

1. 由于该请求的优先级比关键资源(例如脚本/样式)低,因此被渲染引擎推迟了,这通常发生在图片上（可忽略）
2. 该请求被搁置以等待即将释放的不可用的TCP套接字(可忽略)
3. 由于浏览器在HTTP1上每个源仅仅允许6个TCP连接,因此该请求被暂停,如果我们的请求请求的同一个服务器上的资源比较多的话，chrome会自动的为它开辟6个TCP的连接,可观察是否有DNS和SSL握手的时间，如果有证明是一个新的TCP连接。。。。如果超出了6个连接的话,剩余的连接会排队,就是queuing请求等待队列的时间
4. 花费在制作磁盘缓存条目上的时间(通常非常快)

前端解决方案:

- 既然它对每个域有这种限制,我们可以在前端使用CDN,用多个子域名的方式提供服务,例如图片服务器、css服务器、JS服务器,将资源拆到多个子域中均匀分配
- 减少请求的次数,尽量的在一次请求中完成
- 加缓存,利用浏览器的缓存,减少与服务器的交互次数
- 图片的压缩、图片的懒加载、图片的预加载,主动减少一些不必要的加载


## 2. 客户端 《======》 服务器 网络往返是否有问题

### 网络通不通

客户那边发送请求到服务器的时间以及服务器到客户端的时间,最简单的方式就是使用系统shell的命令ping 服务器Ip地址来得到,如果这个速度比较慢的话,那么就证明客户端到服务器的链路上存在着问题,这个问题在本地测试是不存在网络问题的,例如我们本地部署的测试服务器,打开是用localhost:3000打开的,理论上来讲,就自动忽略了网络问题

客户端上行的速度可以在客户端组织一定数量的数据包发给服务器,看服务器的接受速度,服务器可简单的接受后立即返回

服务器的下行速度可以在服务器组织一定数量的数据包发给客户端,看客户端的接受速度,客户端可简单的接受后计算时间

整体的时间都可以放在客户端完成计时操作......

ping -----> 127.0.0.1 看自己本地的TCP协议是否有问题

ping ----> 内网地址 检查本地的IP地址设置是否有误

ping ----> 网关 查看自己和路由器之间的连接是否存在问题

ping ----> 远程服务器地址 看整体的链路是否存在问题....

***ping不的话,直接用mtr来看具体那里有丢包***

假设出现比较慢的情况,我们就需要用到mtr来查看到底是在哪个环节慢了..

    $ sudo mtr  -r (以报告的形式) www.baidu.com 

    HOST: lizhiyuandeMacBook-Pro.loca Loss%   Snt   Last   Avg  Best  Wrst StDev
    1.|-- 192.168.0.1                0.0%    10    1.6   2.3   1.5   8.5   2.2
    2.|-- 192.168.1.1                0.0%    10    1.9   2.2   1.9   3.2   0.5
    3.|-- 116.233.16.1               0.0%    10    5.0  14.7   4.9  57.2  17.4
    4.|-- 61.152.6.85                0.0%    10    4.7   9.6   4.6  28.6   8.6
    5.|-- ???                       100.0    10    0.0   0.0   0.0   0.0   0.0
    6.|-- ???                       100.0    10    0.0   0.0   0.0   0.0   0.0
    7.|-- 180.163.38.30              0.0%    10   13.0   7.2   5.5  13.0   2.9
    8.|-- 116.251.113.218            0.0%    10    5.7   7.3   5.4  19.7   4.4
    9.|-- 42.120.239.173             0.0%    10   11.5  11.5  11.0  12.0   0.3
    10.|-- ???                       100.0    10    0.0   0.0   0.0   0.0   0.0
    11.|-- ???                       100.0    10    0.0   0.0   0.0   0.0   0.0
    12.|-- ???                       100.0    10    0.0   0.0   0.0   0.0   0.0
    13.|-- 47.98.111.171              0.0%    10   10.9  11.4  10.9  13.5   0.8

> 一般首先看最后一跳，如果最后一跳有丢包，那么这个分析才是有意义的。因此判断是否丢包，丢在哪里，看最后几跳是最明显的。不要因报告的100％损失而感到震惊。这并不表示有问题。你可以看到后续的跳数没有损失

ping看到的参数主要是网络的直连情况,如果具体到我们的应用程序的话,我们还要观察端口的连接情况,这部分放在ping通的基础上

### 应用通不通

1. 本地端口的状态

我们在本地 端口 ----> 进程  

        #Liunx
        netstat -nap | grep 端口号

        #mac
        isof -i:端口号 该端口号对应的进程ID

进程 ----> 端口

        #Liunx
        ps -ef | grep 进程
        netstat -nap | grep 进程
        
        #mac
        lsof -p 94580|grep TCP 该进程打开的TCP连接

进程 -----> 开辟的线程

        #Liunx
        pstree -p  进程号
        
        #mac
        #看到的信息有限
        ps -M 进程号

2. 远程端口的状态

        #来测试对应的端口是否正常，端口是否开启,开启后返回的内容,根据这个来判断这个端口的作用....
        curl -v IP地址:端口


3. tcpdump抓包分析---目前感觉作用不大....它主要用来分析网络传输的内容是否是正确的,个人感觉对于整条链路的分析来看,还是要根据实际的情况进行分析....

## 3. 服务器运行代码导致的问题

### 1.代码层面的问题 

如果要准确的知道服务器代码的执行时间,可以使用console.time来计算

从执行路由处理函数再到res.send返回,这期间耗费的时间可以理解为是服务器代码的执行时间...

这个时间并不一定 != 浏览器的TTFB的时间

因为浏览器的TTFB的时间 = 网络往返的时间（本地测试忽略） + 服务器处理时间

但是如果是在忽略网速的情况下,也就是在本地测试服务器启动应用的时候,那么，默认这个浏览器的等待时间TTFB = 服务器的处理时间


### 2. 系统调用方面的问题






















