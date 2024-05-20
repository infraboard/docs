---
title: 分布式锁 
sidebar_label: 分布式锁 
---


支持
+ go_cache: 基于内存的本地缓存, 单体服务时使用
+ redis: redis分布式锁, 分布式时使用 

## 配置组件

```toml tab
[lock]
  # 默认使用 go_cache
  # 如果想使用redis分布式锁, 需要配置redis, 具体见redis相关配置
  provider = "go_cache"
```

```env tab
LOCK_PROVIDER="go_cache"
```

## 基本使用

```go
package main

import (
	"context"
	"time"

	"github.com/infraboard/mcube/v2/ioc/config/lock"
)

func main() {
	// 创建一个key为test, 超时时间为10秒的锁
	locker := lock.L().New("test", 10*time.Second)

	ctx := context.Background()

	// 获取锁
	if err := locker.Lock(ctx); err != nil {
		panic(err)
	}

	// 释放锁
	defer locker.UnLock(ctx)
}
```