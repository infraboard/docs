---
title: Redis 使用
sidebar_label: Redis 使用
---

这里我们选择集成: [go-redis](https://github.com/redis/go-redis)

## 配置组件

```toml tab
[redis]
  endpoints = ["127.0.0.1:6379"]
  db = 0
  username = ""
  password = ""
  trace = true
  enable_metrics = false
```

```env tab
REDIS_ENDPOINTS="127.0.0.1:6379"
REDIS_DB=0
REDIS_USERNAME=""
REDIS_PASSWORD=""
REDIS_TRACE=true
REDIS_METRIC=false
```

## 基本使用

```go
package main

import (
	"fmt"

	"github.com/infraboard/mcube/v2/ioc/config/redis"
)

func main() {
	client := redis.Client()
	fmt.Println(client)
}
```

## 样例演示

### 环境准备

```sh
docker run -itd --name redis -p 6379:6379 redis
```