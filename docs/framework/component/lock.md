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

## Lock

```go
func TestRedisLock(t *testing.T) {
	os.Setenv("LOCK_PROVIDER", lock.PROVIDER_REDIS)
	ioc.DevelopmentSetup()
	g := &sync.WaitGroup{}
	for i := range 9 {
		go LockTest(i, g)
	}
	g.Wait()
	time.Sleep(10 * time.Second)
}

func LockTest(number int, g *sync.WaitGroup) {
	fmt.Println(number, "start")
	g.Add(1)
	defer g.Done()
	m := lock.L().New("test", 1*time.Second)
	if err := m.Lock(ctx); err != nil {
		fmt.Println(err)
	}
	fmt.Println(number, "down")
}
```

```sh
=== RUN   TestRedisLock
8 start
3 start
0 start
5 start
4 start
1 start
6 start
7 start
2 start
6 down
5 down
4 down
3 down
1 down
7 down
0 down
8 down
2 down
--- PASS: TestRedisLock (10.00s)
```

## Try Lock

```go
func TestRedisTryLock(t *testing.T) {
	os.Setenv("LOCK_PROVIDER", lock.PROVIDER_REDIS)
	ioc.DevelopmentSetup()
	g := &sync.WaitGroup{}
	for i := range 9 {
		go TryLockTest(i, g)
	}
	g.Wait()
	time.Sleep(10 * time.Second)
}

func TryLockTest(number int, g *sync.WaitGroup) {
	fmt.Println(number, "start")
	g.Add(1)
	defer g.Done()
	m := lock.L().New("test", 1*time.Second)
	if err := m.TryLock(ctx); err != nil {
		fmt.Println(number, err)
		return
	}
	fmt.Println(number, "obtained lock")
}
```

```sh
=== RUN   TestRedisTryLock
8 start
3 start
1 start
4 start
0 start
7 start
2 start
5 start
6 start
8 obtained lock
3 lock: not obtained
6 lock: not obtained
2 lock: not obtained
4 lock: not obtained
7 lock: not obtained
0 lock: not obtained
1 lock: not obtained
5 lock: not obtained
```