<!--
 * @Author: lizhiyuan
 * @Date: 2020-11-25 10:42:52
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-12-23 17:42:58
-->
# mongodb分片

## 概念

分片是一种将数据分配到多个机器上的方法.mongodb通过分片技术来支持具有海量数据集和高吞吐量操作的部署方案

解决系统增长的方法有两种:垂直扩展和水平扩展

水平扩展是通过将系统的数据集划分至多台机器，并根据需要添加服务器来提升容量.虽然单个机器的总体速度或容量可能不高，但每台机器只需要处理整个数据集的某个子集，所以可能会提供比单个高速大容量服务器更高的效率


## 分片集群

一个mongodb分片集群由以下组件组成:

- shard 每个分片包含被分片的数据集中的一个子集.每个分片必须部署为副本集架构

- mongos 充当查询路由的角色，为客户端应用程序和分片集群间的通信提供一个接口

- config servers 配置服务器存储了分片集群的元数据和配置信息，必须部署为副本集架构

到目前为止，你都是把MongoDB当做一台服务器在用，每个mongod实例都包含应用程序数据的完整副本。就算使用了复制，每个副本也都是完整克隆了其他副本的数据。对于大多数应用程序而言，在一台服务器上保存完整数据集是完全可以接受的。但随着数据量的增长，以及应用程序对读写吞吐量的要求越来越高，普通服务器渐渐显得捉襟见肘了。尤其是这些服务器可能无法分配足够的内存，或者没有足够的CPU核数来有效处理工作负荷。除此之外，随着数据量的增长，要在一块磁盘或者一组RAID阵列上保存和管理备份如此大规模的数据集也变得不太现实。如果还想继续使用普通硬件或者虚拟硬件来托管数据库，那么这对这类问题的解决方案就是将数据库分布到多台服务器上，这种方法称之为分片

**分片**

MongoDB分片集群将数据分布在一个或多个分片上。每个分片部署成一个MongoDB副本集，该副本集保存了集群整体数据的一部分。因为每个分片都是一个副本集，所以他们拥有自己的复制机制，能够自动进行故障转移。你可以直接连接单个分片，就像连接单独的副本集一样。但是，如果连接的副本集是分片集群的一部分，那么只能看到部分数据


**mongos路由器**

如果每个分片都包含部分集群数据，那么还需要一个接口连接整个集群。这就是mongos。mongos进程是一个路由器，将所有的读写请求指引到合适的分片上。如此一来，mongos为客户端提供了一个合理的系统视图。

mongos进程是轻量级且非持久化的。它们通常运行与与应用服务器相同的机器上，确保对任意分片的请求只经过一次网络跳转。换言之，应用程序连接本地的mongos，而mongos管理了指向单独分片的连接。

**配置服务器**

如果mongos进程是非持久化的,那么必须有地方能持久保存集群的公认状态.这就是配置服务器的工作.


## 实际部署

```
shard Server 1 : 27020
shard Server 2 : 27021
shard Server 3 : 27022
shard Server 4 : 27023

config Server : 27100
route Process : 40000
```

### 1. 启动分片服务器(副本集)

```shell
// 启动分片1
mongod --port 27020
// 启动分片2
mongod --port 27023 
```

### 2. 启动config Server
```shell
// 像正常启动mongodb服务器一样启动configServer
mongod --port 27100
```


### 3. 启动mongos

```shell
// 启动mongos,将配置服务器作为参数启动

mongos --port 40000 --configdb localhost:27100 

```

### 4. 连接mongos,添加分片信息

```
// 连接mongos服务器

mongo localhost:40000/admin

// 添加我们的分片服务器
db.runCommand({addshard:"localhost:27020"})
// 添加我们的分片服务器
db.runCommand({addshard:"localhost:27029"})
```

### 5.开始分片操作

```
// 要分片的数据库
db.runCommand({enablesharding:"mydb"});
// 设置要分片的集合:users集合,name字段作为key来分片
// 1:主键值正向遍历
// 2:主键值反向遍历
// hashed:主键hash值
db.runCommand({shardcollection:"mydb.users",key:{name:1}})
```




