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

1. 通过NewGetter使用缓存装饰器, 通过提供ObjectFinder函数来返回需要缓存的数据
```go
package main

import (
	"context"

	"github.com/infraboard/mcube/v2/ioc/config/cache"
)

type TestStruct struct {
	Id     string
	FiledA string
}

func main() {
	ctx := context.Background()

	var v *TestStruct

	// objectId --->  cached Objected
	// 获取objectId对应的对象, 如果缓存中有则之间从缓存中获取, 如果没有 则通过提供的ObjectFinder直接获取
	err := cache.NewGetter(ctx, func(ctx context.Context, objectId string) (any, error) {
		return &TestStruct{Id: objectId, FiledA: "test"}, nil
	}).Get("objectId", v)
	if err != nil {
		panic(err)
	}
}
```

2. 当然也可以直接使用缓存接口Set和Get来自己封装缓存逻辑
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