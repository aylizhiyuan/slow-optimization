<!--
 * @Author: lizhiyuan
 * @Date: 2020-09-29 09:54:09
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-12-29 10:41:05
-->
# node实战技术分享

node核心模块中的很多功能都适用于不同的应用场景....自己开发模块的乐趣是了解底层的实现后,可以做出一些很有意思的小东西...这些东西看起来不起眼,但是做着做着没准会越做越大...

所以,细心观察,javascript未来可期.....

## node多进程

node多进程其实是可以做一些多进程任务的,提高任务的执行效率,与此同时的话,可以做一些应用的监控、操作系统的分析、性能分析之类的,多进程主要是fork,各个进程之间可以进行IPC通信,cluster可以实现集群，多个进程同时运行同一套代码(根据Cpu核数),并监控同一个端口,应用更多的是服务器方向

## node流

流的话可以用来处理不同类型的数据,例如xls/pdf/mp3/mp4...

## node网络模块net

主要可以用来处理一些需要进行分布式操作的应用...建立RPC远程间的通信

## node常规排查的指标

1. 查看错误日志,我们的错误日志需要统一的推送到ELK平台
2. 找到性能开销大的进程,一般为主进程和队列进程，使用clinic进行生产系统的分析,通过火焰图和堆栈eventLoop分析找到开销较大的函数针对性的进行优化

大量的开辟对象会使得当前进程中的内存上涨,大量的循环、遍历、过滤、排序会让CPU的使用率上涨.....


















