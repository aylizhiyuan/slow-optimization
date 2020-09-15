# 数据库mongodb操作指南

## mongoose基本操作

### 1. 查询

```
    // 查询所有的集合数据
    // var allClient = await Client.find({});

    // 查询带有条件的集合数据
    // var result = await Client.find({"client":"000"});

    // 查询只要符合一个条件的集合数据,逻辑或;也可以用select代替第二个参数
    // var result = await Client.find({$or:[{"client":"000"},{"address":"上海"}]},{"name":1})

    // 查询符合所有条件的集合数据,逻辑与;也可以用select代替第二个参数
    // var result = await Client.find({$and:[{"client":"000"},{"address":"上海"}]},{"name":1})

    // 查询某个字段符合数组中值
    // var result = await People.find({employee_status: {$in: ['P', 'H', 'S']}});

    // 查看某个字段大于某个具体数值
    // var result = await Client.find({"active_user_number":{$gt:100}}).select("active_user_number");

    // 查看某个字段小于某个具体数值
    // $gt -------- greater than  >
    // $gte --------- gt equal  >=
    // $lt -------- less than  <
    // $lte --------- lt equal  <=
    // $ne ----------- not equal  !=
    // $eq  --------  equal  =
    // var result = await Client.find({"active_user_number":{$lt:100}}).select("active_user_number")
    

    // 查询指定偏移量的指定数量的集合数据
    // var result = await Client.find().skip(10).limit(10);

    // 查看一条符合条件的集合数据
    // var result = await Client.findOne({});

    // 统计符合条件的集合数目
    // var result = await Client.count({"block":"true"});

    // 去重
    // var result = await People.distinct('client');

    // 排序
    // var result = await Client.find({}).sort({"client":1});

```


mongoose查询大量数据的时候的时间可能无法再进行优化，大量的数据必须写入到内存中,内存可能会在短时间内暴涨或直接崩溃..最好的办法是使用游标的形式不断的将数据读入

```
    //游标
    console.time("查询时间");
    // 直接查询的速度1秒左右
    var cursor = await Client.find()

    // 1. next方法:直接返回游标的速度极快,大概5毫秒左右
    var cursor = await Client.find().cursor();
    for(let doc = await cursor.next();doc!= null;doc = await cursor.next()){
        // console.log(doc);
    }

    // 2. eachAsync方法:直接读取
    await cursor.eachAsync(doc=>{
        // console.log(doc);
    });
    console.timeEnd("查询时间");
```

整体测试的结果为查询速度不会快很多，但是因为可以分段查询，所以，可以将大量数据写入内存这个操作变得可控，甚至可以考虑分段进行操作

```
//这是我封装后的抽象Model
var Dao = require('./Dao');
//这是我根据抽象的Model查找到实体的Model
var professionDao = Dao('profession');
/**
 * 游标函数
 * @param _start 游标的起始位置
 * @param _limit 游标的分页数量
 * @param _callback 游标执行函数
 */
function cursor(_start,_limit,_callback){
  //初始化数据定义
  var start,limit,flag,len;
  //初始化起始位置
  start = !_start || _start < 0 ? 0 : _start;
  //初始化分页数量
  limit = !_limit || _limit < 1 ? 1 : _limit;
  //使用Model执行分页查询
  professionDao.find().skip(start).limit(limit).exec(function(err,docs){
    //缓存长度
    len = docs.length;
    //如果没有查询到，证明已经查询完毕
    if(len === 0){
      console.log('遍历结束');
    }
    //初始化循环结束标记
    flag = 0;
    //遍历
    docs.forEach(function(doc){
      //如果有执行函数就执行
      if(_callback && toString.call(_callback) === '[object Function]'){
        _callback(doc);
      }
      //如果循环到末尾，则迭代
      if(len == ++flag){
        cursor(start + docs.length,limit);
      }
    });
  });
}
//执行
cursor(0,10,function(doc){
  console.log(doc._id);
});

```

### 2. 新增

新增多个值到数组


```
"$push":{"bank_types":{"$each":bank_types}}  
{$push:{question_tags:mult_tag_list}}

```
### 3. 修改

### 4. 删除

删除某个值从数组、对象

```

{$pull:{bank_tags:del_tag_name}}

```


## mongoose聚合

aggregate可以有效的提高查询效率


### 1. 语法

```
>db.COLLECTION_NAME.aggregate(AGGREGATE_OPERATION)
```

```
- $sum	计算总和。	db.mycol.aggregate([{$group : {_id : "$uid", num_tutorial : {$sum : "$visit"}}}])
- $avg	计算平均值	db.mycol.aggregate([{$group : {_id : "$uid", num_tutorial : {$avg : "$visit"}}}])
- $min	获取集合中所有文档对应值得最小值。	db.mycol.aggregate([{$group : {_id : "$uid", num_tutorial : {$min : "$visit"}}}])
- $max	获取集合中所有文档对应值得最大值。	db.mycol.aggregate([{$group : {_id : "$uid", num_tutorial : {$max : "$visit"}}}])
- $push	在结果文档中插入值到一个数组中。	db.mycol.aggregate([{$group : {_id : "$uid", url : {$push: "$url"}}}])
- $addToSet	在结果文档中插入值到一个数组中，但不创建副本。	db.mycol.aggregate([{$group : {_id : "$uid", url : {$addToSet : "$url"}}}])
- $first	根据资源文档的排序获取第一个文档数据。	db.mycol.aggregate([{$group : {_id : "$uid", first_url : {$first : "$url"}}}])
- $last	根据资源文档的排序获取最后一个文档数据	db.mycol.aggregate([{$group : {_id : "$uid", last_url : {$last : "$url"}}}])
db.article.insert({uid:1,content:'3',url:'url1'});
db.article.aggregate([{$group : {_id : "$uid", url : {$push: "$url"}}}])
```


## 2. 管道

管道在Unix和Linux中一般用于将当前命令的输出结果作为下一个命令的参数。 MongoDB的聚合管道将MongoDB文档在一个管道处理完毕后将结果传递给下一个管道处理。管道操作是可以重复的。

- $project：修改输入文档的结构。可以用来重命名、增加或删除域，也可以用于创建计算结果以及嵌套文档。
- $match：用于过滤数据，只输出符合条件的文档。$match使用MongoDB的标准查询操作。
- $limit：用来限制MongoDB聚合管道返回的文档数。
- $skip：在聚合管道中跳过指定数量的文档，并返回余下的文档。
- $unwind：将文档中的某一个数组类型字段拆分成多条，每条包含数组中的一个值。
- $group：将集合中的文档分组，可用于统计结果。
- $sort：将输入文档排序后输出
- $lookup:关联查询

```
        People.aggregate({
        $match:{
            client:ObjectID("5cf631a71dc8ccb72bba2a57"),
            employee_status:{
                "$in":["P","H","S"]
            },
            block:false
        }
    },{
        $lookup:{
            from: "clients",
            localField: "client",
            foreignField: "_id",
            as: "client" //可覆盖之前的字段
        }
    },{
        $project:{
            "_id":1,
            "history_position":1,
            //client:1,
            "client._id":1, //这里指定关联表中的具体字段
            "client.address":1
        }
    }).exec(function(err,result){
        return res.send(result);
    })
```

## mongoose事务


