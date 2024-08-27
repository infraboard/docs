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
  enable_trace = true
  enable_metrics = false
```

```env tab
REDIS_ENDPOINTS="127.0.0.1:6379"
REDIS_DB=0
REDIS_USERNAME=""
REDIS_PASSWORD=""
REDIS_ENABLE_TRACE=true
REDIS_ENABLE_METRICS=false
```

## 环境准备

```sh
docker run -itd --name redis -p 6379:6379 redis
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


