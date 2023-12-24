---
title: 数据缓存
sidebar_label: 数据缓存
---

支持
+ go cache: 内存缓存
+ redis: redis缓存

## 配置组件

```toml tab
[cache]
  # 使用换成提供方, 默认使用GoCache提供的内存缓存, 如果配置为redis 还需要配置redis的配置
  provider = "go_cache"
  # 单位秒, 默认5分钟
  ttl = 300
```

```env tab
CACHE_PROVIDER="go_cache"
CACHE_TTL=300
```

## 基本使用

```go
package main

import (
	"context"

	"github.com/infraboard/mcube/v2/ioc/config/cache"
)

type TestStruct struct {
	FiledA string
}

func main() {
	ctx := context.Background()

	c := cache.C()

	key := "test"
	obj := &TestStruct{FiledA: "test"}

	// 设置缓存
	err := c.Set(ctx, key, obj, cache.WithExpiration(300))
	if err != nil {
		panic(err)
	}

	// 后期缓存
	var v *TestStruct
	err = c.Get(ctx, key, v)
	if err != nil {
		panic(err)
	}
}
```