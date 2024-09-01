---
title: MongoDB 数据库操作
sidebar_label: MongoDB 数据库操作
---

monogodb 有Go语言官方SDK, 因此直接使用[官方SDK Mongo Driver](https://www.mongodb.com/docs/drivers/go/current/quick-start/)来操作MongoDB

## 配置组件

```toml tab
[mongo]
  endpoints = ["127.0.0.1:27017"]
  username = "admin"
  password = "123456"
  database = "admin"
  auth_db = "admin"
  enable_trace = true
```

```env tab
MONGO_ENDPOINTS="127.0.0.1:27017"
MONGO_USERNAME="admin"
MONGO_PASSWORD="123456"
MONGO_DATABASE="admin"
MONGO_AUTH_DB="admin"
MONGO_ENABLE_TRACE=true
```

## 环境准备

```
docker run -itd -p 27017:27017 --name mongo mongo
```

## 基本使用

```go
package main

import (
	"fmt"

	"github.com/infraboard/mcube/v2/ioc/config/mongo"
)

func main() {
	// 获取mongodb 客户端对象
	client := mongo.Client()
	fmt.Println(client)

	// 获取DB对象
	db := mongo.DB()
	fmt.Println(db)
}
```

## CURD样例

下面整理了一些CRUD常用方式, 更详细信息请参考[MongoDB CRUD Operations](https://www.mongodb.com/docs/manual/crud/)

go 通过struct tag:bson 来完成 struct <===> bson的映射, 具体请参考[Use Struct Tags](https://www.mongodb.com/docs/drivers/go/current/usage-examples/struct-tagging/)
```go
type Restaurant struct {
	ID           primitive.ObjectID `bson:"_id"`
	Name         string
	RestaurantId string `bson:"restaurant_id"`
	Cuisine      string
	Address      interface{}
	Borough      string
	Grades       interface{}
}
```

struct tag如下:
+ inline: 将字段“扁平化”, 类似于gorm里面的embed
+ omitempty: 相当于json里面的omitempty, 当字段的值为空时，该字段将从编码中省略
+ minsize: 如果在 int64、uint、uint32 或 uint64 类型的字段上指定了 minsize 结构标签，并且字段的值可以适合一个有符号的 int32，则该字段将被序列化为 BSON int32
+ truncate: 如果在非浮点数字类型的字段上指定了 truncate 结构标签，则反序列化到该字段的 BSON double 将在小数点处被截断

### Insert

用到的方法:
+ db.collection.insertOne()
+ db.collection.insertMany()

![mongo_insert](/img/mcube/mongo_insert.png)

### Query

用到的方法:
+ db.collection.find()
+ db.collection.findOne()

![mongo_query](/img/mcube/mongo_query.png)

#### 基础案例

1. findOne案例
```go
coll := client.Database("sample_restaurants").Collection("restaurants")
// Creates a query filter to match documents in which the "name" is
// "Bagels N Buns"
filter := bson.M{"name": "Bagels N Buns"}
// Retrieves the first matching document
var result Restaurant
err = coll.FindOne(context.TODO(), filter).Decode(&result)
```

2. find案例
```go
coll := client.Database("sample_restaurants").Collection("restaurants")
// Creates a query filter to match documents in which the "cuisine"
// is "Italian"
filter := bson.M{"cuisine": "Italian"}
// Retrieves documents that match the query filter
cursor, err := coll.Find(context.TODO(), filter)
if err != nil {
	panic(err)
}
// Unpacks the cursor into a slice
var results []Restaurant
if err = cursor.All(context.TODO(), &results); err != nil {
	panic(err)
}
```

#### 查询条件

1. and
```sql
SELECT * FROM inventory WHERE status = "A" AND qty < 30
```

如果像构造一个多条件的AND查询, 只需要构建一个map就行, 里面每一对kv就表示一个where条件,比如:
```go
// { status: "A", qty: { $lt: 30 } }
cursor, err := coll.Find(context.TODO(),bson.M{
		"status": "A",
		"qty": bson.M{"$lt": 30},
	})
```

2. or


3. like


其他[query-selectors](https://www.mongodb.com/docs/manual/reference/operator/query/#std-label-query-selectors)

### Update

用到的方法:
+ db.collection.updateOne()
+ db.collection.updateMany()
+ db.collection.replaceOne()

![mongo_update](/img/mcube/mongo_update.png)

### Delete

用到的方法:
+ db.collection.deleteOne()
+ db.collection.deleteMany()

![mongo_delete](/img/mcube/mongo_delete.png)


