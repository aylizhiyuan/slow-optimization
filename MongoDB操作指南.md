# 数据库mongodb操作指南

## mongoose基本操作

### 1. 查询

```
    // 字段为空或为null，则返回所有的数据
    // var allClient = await Client.find({});

    // 条件过滤，返回符合条件的数据
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
    // $gt -------- 大于  >
    // $gte --------- 大于等于  >=
    // $lt -------- 小于  <
    // $lte --------- 小于等于  <=
    // $ne ----------- 不等于  !=
    // $eq  --------  等于  =
    // $exists -----  是否存在
    // var result = await Client.find({"active_user_number":{$lt:100}}).select("active_user_number")
    

    // 查询指定偏移量的指定数量的集合数据
    // skip函数的功能是略过指定数量的匹配结果，返回余下的查询结果
    // 在查询操作中,有时数据量会很大,这时我们就需要对返回结果的数量进行限制 那么我们就可以使用limit函数
    // var result = await Client.find().skip(10).limit(10);

    // 查看一条符合条件的集合数据
    // var result = await Client.findOne({});

    // 统计符合条件的集合数目
    // var result = await Client.count({"block":"true"});

    // 去重
    // var result = await People.distinct('client');

    // 排序
    // sort函数可以将查询结果数据进行排序操作 该函数的参数是一个或多个键/值对 键代表要排序的键名,值代表排序的方向,1是升序,-1是降序 
    // var result = await Client.find({}).sort({"client":1});

    // 关联查询
    // 在Schema中添加ref属性，指明此外键是哪个集合中的外键
    // var result = await Client.find({}).populate('user')

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

```
    // 直接调用create方法创建新的集合
    await Client.create({
        username: 'root',
        password: '000000',
        firstname: '超级',
        lastname: '管理员',
        birthday: new Date('1978-11-25'),
        gender: 'M',
        email: 'root@gisiclouds.com'
    })
```

### 3. 修改


```
    // 语法规则
    db.collection.update(
    <query>,
    <update>,
    {
        upsert: <boolean>,
        multi: <boolean>,
        writeConcern: <document>
    }
)
```

- query : update的查询条件，类似sql update查询内where后面的
- update : update的对象和一些更新的操作符（如$,$inc…）等，也可以理解为sql update查询内set后面的
    - $set:用来指定一个键并更新键值，若键不存在并创建
    - $inc:可以对文档的某个值为数字型（只能为满足要求的数字）的键进行增减的操作
    - $unset:可以用来删除键
    - $push:向文档的某个数组类型的键添加一个数组元素，不过滤重复的数据。添加时键存在，要求键值类型必须是数组；键不存在，则创建数组类型的键
    - $pull:从数组中删除满足条件的元素
    - $pop:从数组的头或者尾删除数组中的元素
    - 在需要对数组中的值进行操作的时候，可通过位置或者定位操作符（"$"）.数组是0开始的，可以直接将下标作为键来选择元素。
- upsert : 可选，这个参数的意思是，如果不存在update的记录，是否插入objNew，true为插入，默认是false，不插入
- multi : 可选，mongodb 默认是false，只更新找到的第一条记录，如果这个参数为true，就把按条件查出来多条记录全部更新
- writeConcern :可选，抛出异常的级别

```
await People.update({client: client, people_no: people_no}, {$push: { custom_fields: cus}});
await User.update({_id: user._id,"menus._id": menu_id}, {$inc: {"menus.$.number": 1}}
await  VersionUser.update({ _id: result._id }, { $set: { isread: 1 } })
await BudgetSet.updateMany({ position: { $in: cond.positions }, budget_main: cond.budget_main, type: { $in: month } }, { $pull: { ci_lock: uuid } });

```


### 4. 删除

```
await ClientToken.remove({
    client: client_id,
    _id: {
		$ne: token_id
	}
```




## mongoose聚合

聚合的速度要高于find查询，但是消耗的内存会比find更多,从这点上来看,聚合适应的场景应该还是面对大数据查询的时候尽量的采用聚合比较合适...用空间换取时间

### 1. 分组

现在我们通过以上集合计算每个作者所写的文章数，使用aggregate()计算结果如下：
```
> db.article.insert({uid:1,content:'1'});
> db.article.insert({uid:2,content:'2'});
> db.article.insert({uid:1,content:'3'});
 db.article.aggregate([{$group:{_id:'$uid',total:{$sum:1}}}]);
 { "_id" : 2, "total" : 1 }
{ "_id" : 1, "total" : 2 }
```

### 2. 聚合

下面展示集合中的数据

```
{
   _id: ObjectId(7df78ad8902c)
   title: 'MongoDB Overview', 
   description: 'MongoDB is no sql database',
   by_user: 'runoob.com',
   url: 'http://www.runoob.com',
   tags: ['mongodb', 'database', 'NoSQL'],
   likes: 100
},
{
   _id: ObjectId(7df78ad8902d)
   title: 'NoSQL Overview', 
   description: 'No sql database is very fast',
   by_user: 'runoob.com',
   url: 'http://www.runoob.com',
   tags: ['mongodb', 'database', 'NoSQL'],
   likes: 10
},
{
   _id: ObjectId(7df78ad8902e)
   title: 'Neo4j Overview', 
   description: 'Neo4j is no sql database',
   by_user: 'Neo4j',
   url: 'http://www.neo4j.com',
   tags: ['neo4j', 'database', 'NoSQL'],
   likes: 750
},
```

计算聚合数据

```
- $sum 计算总和 db.mycol.aggregate([{$group : {_id : "$by_user", num_tutorial : {$sum : "$likes"}}}])
- $avg 计算平均值 db.mycol.aggregate([{$group : {_id : "$by_user", num_tutorial : {$avg : "$likes"}}}])
- $min 获取集合汇总所有文档对应值的最小值 db.mycol.aggregate([{$group : {_id : "$by_user", num_tutorial : {$min : "$likes"}}}])
- $max 获取集合中所有文档对应值的最大值 db.mycol.aggregate([{$group : {_id : "$by_user", num_tutorial : {$max : "$likes"}}}])
- $push 在结果文档中插入值到一个数组里 db.mycol.aggregate([{$group : {_id : "$by_user", url : {$push: "$url"}}}])
- $addToSet 在结果文档中插入值到一个数组中，但不创建副本 db.mycol.aggregate([{$group : {_id : "$by_user", url : {$addToSet : "$url"}}}])
- $first 根据资源文档的排序获取第一个文档数据 db.mycol.aggregate([{$group : {_id : "$by_user", first_url : {$first : "$url"}}}])
- $last 根据资源文档的排序获取最后一个文档数据 db.mycol.aggregate([{$group : {_id : "$by_user", last_url : {$last : "$url"}}}])
```

### 3. 过滤

- $project:修改输入文档的结构。可以用来重命名、增加或删除域，也可以用于创建计算结果以及嵌套文档
- \$match:用于过滤数据,只输出符合条件的文档。$match使用MongoDB的标准查询操作。
- $limit:用来限制MongoDB聚合管道返回的文档数。
- $skip:在聚合管道中跳过指定数量的文档，并返回余下的文档。
- $unwind:将文档中的某一个数组类型字段拆分成多条，每条包含数组中的一个值。
- $group:将集合中的文档分组，可用于统计结果。
- $sort:将输入文档排序后输出。
- $geoNear:输出接近某一地理位置的有序文档。
- $lookup:关联查询
    - from:'users'  // 从哪个Schema中查询（一般需要复数，除非声明Schema的时候专门有处理）
    - localField:'_id',  // 本地关联的字段
    - foreignField:'department', // user中用的关联字段
    - as:'users' // 查询到所有user后放入的字段名，这个是自定义的，是个数组类型

简单的,关联查询某个字段

```
    CompensationBudgetFlowChart.aggregate([
        {$match:cont},//主表条件
        {
            $lookup: {
                from: 'compensationbudgetmains',
                localField: 'budget_main',
                foreignField: '_id',
                as: 'budget_main_info'
            }
        },
        {
            $project:showFiled  //显示的字段
        },
    ])
```

需要数组展开的案例

```
var dataList = yield ProcessInstance.aggregate([
    {$match: cond},
    {$lookup: {from: 'taskinstances',localField: 'current_task',foreignField: '_id', as: 'current_task'}},
    {$unwind: {path:"$current_task",preserveNullAndEmptyArrays:true}},
    {$lookup: {from: 'processdefines',localField: 'process_define',foreignField: '_id', as: 'process_define'}},
    {$unwind: {path:"$process_define",preserveNullAndEmptyArrays:true}},
    {$lookup: {from: 'tmcustomizeattendances',localField: 'collection_id',foreignField: '_id', as: 'cusAttendance'}},
    {$unwind: {path:"$cusAttendance",preserveNullAndEmptyArrays:true}},
    // {$match: {"process_define.$.process_code": "CustomizeAttendance"}},
    {$project: {_id:1, process_instance_name:1,"process_define._id":1,"process_define.process_code":1, process_state:1, current_task:1, process_start:1, cusAttendance:1}}
  ]).exec()
```

需要显示特定字段下的属性例子

```
    piApproveData = await TmSubCustomizeApproval.aggregate(
            [
                {$match:TmSubCustomizeApprovalWhere},//主表条件
                {
                    $lookup: {
                        from: 'peoples',
                        localField: 'people',
                        foreignField: '_id',
                        as: 'userinfo'
                    }
                },
                {$match:appuserCond},//peopeos表条件
                {
                    $lookup: {
                        from: 'tmcustomizeapprovalvalues',
                        localField: 'cus_field_values',
                        foreignField: '_id',
                        as: 'cusvalinfo'
                    }
                },
                {$match:TmCustomizeApprovalValueWhere},//values表条件
                {
                    $project:{
                      _id: 1,
                      people:1,//出海人员 people
                      result:1,//核准结论 0: 待核准，1: 核准生效，-1：核准删除
                      is_full_day:1,//是否是全天  默认全天
                      start_date: 1, //事件开始日期
                      end_date: 1, //事件结束日期
                      start_time: 1, // 非全天时的具体开始时间，时：分格式
                      end_time: 1, // 非全天时的具体结束时间，时：分格式
                      cus_field_values:1,
                      remark:1,
                      people_no:"$userinfo.people_no",
                      people_name:"$userinfo.people_name",
                      ou_name:"$userinfo.ou_name",
                      position_name:"$userinfo.position_name",
                      cusvalinfo:"$cusvalinfo"
                    }
                },
                {
                    $group:{            //根据人员分组
                        _id:"$people",
                        arrdata:{$push:'$$ROOT'},
                    }
                },
                {$skip:skip},
                {$limit:limit},
            ]).exec();
```







