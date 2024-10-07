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
  trace = true
```

```env tab
MONGO_ENDPOINTS="127.0.0.1:27017"
MONGO_USERNAME="admin"
MONGO_PASSWORD="123456"
MONGO_DATABASE="admin"
MONGO_AUTH_DB="admin"
MONGO_TRACE=true
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

go 通过struct tag:bson 来完成 struct与bson的映射, 具体请参考[Use Struct Tags](https://www.mongodb.com/docs/drivers/go/current/usage-examples/struct-tagging/)
```go
type Restaurant struct {
	Name         string
	RestaurantId string        `bson:"restaurant_id,omitempty"`
	Cuisine      string        `bson:"cuisine,omitempty"`
	Address      interface{}   `bson:"address,omitempty"`
	Borough      string        `bson:"borough,omitempty"`
	Grades       []interface{} `bson:"grades,omitempty"`
}
```

struct tag如下:
+ inline: 将字段“扁平化”, 类似于gorm里面的embed
+ omitempty: 相当于json里面的omitempty, 当字段的值为空时，该字段将从编码中省略
+ minsize: 如果在 int64、uint、uint32 或 uint64 类型的字段上指定了 minsize 结构标签，并且字段的值可以适合一个有符号的 int32，则该字段将被序列化为 BSON int32
+ truncate: 如果在非浮点数字类型的字段上指定了 truncate 结构标签，则反序列化到该字段的 BSON double 将在小数点处被截断


### 环境准备

```sh
docker run -itd -p 27017:27017 --name mongo mongo
```

### Insert

![mongo_insert](/img/mongo/insert.png)

用到的方法:
+ db.collection.insertOne()
+ db.collection.insertMany()

直接将对象传入即可:
```go
result := &Restaurant{}
result, err := coll.InsertOne(context.TODO(),result)
```

### Query

![mongo_query](/img/mongo/query.png)

用到的方法:
+ db.collection.find()
+ db.collection.findOne()

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
```sql
SELECT * FROM inventory WHERE status = "A" OR qty < 30
```

```go
// { $or: [ { status: 'A' }, { qty: { $lt: 30 } } ] }
cursor, err := coll.Find(context.TODO(),bson.M{"$or": bson.A{
	bson.M{"status": "A"},
	bson.M{"qty": bson.M{"$lt": 30}},
}})
```

3. like
```sql
SELECT * FROM inventory WHERE status = "A" AND ( qty < 30 OR item LIKE "p%")
```

```go
// { status: 'A', $or: [{ qty: { $lt: 30 } }, { item: { $regex: '^p' } }]}
cursor, err := coll.Find(context.TODO(),bson.M{"status": "A", "$or": bson.A{
	bson.M{"qty": bson.M{"$lt": 30}},
	bson.M{"item": bson.M{"$regex": "^p", "$options": "im"}},
}})
```

+ $lt
+ $or
+ $regex

上面这些都是mongo里面的查询选择器, 更多信息请参考[query-selectors](https://www.mongodb.com/docs/manual/reference/operator/query/#std-label-query-selectors)

### Update

![mongo_update](/img/mongo/update.png)

用到的方法:
+ db.collection.updateOne()
+ db.collection.updateMany()
+ db.collection.replaceOne()

```go
// Creates instructions to add the "avg_rating" field to documents
result := &Restaurant{}
// Updates the first document that has the specified "_id" value
result, err := coll.UpdateOne(context.TODO(), bson.M{"_id": "<your id>"}, bson.M{"$set": result})
```

### Delete

![mongo_delete](/img/mongo/delete.png)

用到的方法:
+ db.collection.deleteOne()
+ db.collection.deleteMany()

```go
// Deletes the first document that has a "title" value of "Twilight"
result, err := coll.DeleteOne(context.TODO(),  bson.M{"_id": "<your id>"})
```



