---
title: MongoDB 数据库操作
sidebar_label: MongoDB 数据库操作
---


monogodb 有Go语言官方SDK, 因此直接使用官方SDK Mongo Driver来操作MongoDB


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

