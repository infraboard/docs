---
title: 框架概述
sidebar_label: 框架概述
---

mcube是一款用于构建渐进式微服务(单体-->微服务)的框架, 让应用从单体无缝过渡到微服务, 同时提供丰富的配置即用的功能配置, 
只需简单配置就可拥有:
+ Log: 支持文件滚动和Trace的日志打印
+ Metric: 支持应用自定义指标监控
+ Trace: 集成支持完整的全链路追踪(HTTP Server/GRPC Server/数据库...)以及自定义埋点
+ CORS: 资源跨域共享
+ Health Check: HTTP 和 GRPC 健康检查
+ API DOC: 基于Swagger的 API 文档

除了上面这些功能配置，还会用到很多三方工具, 也是配置即用:
+ MySQL: Grom集成
+ MongoDB 官方驱动集成
+ Redis: go-redis集成
+ Kafka: kafka-go集成
+ 分布式缓存: 当前只适配了Redis
+ 分布式锁: 当前只适配了Redis

:::info 提示
mcube的核心理念是提供一套优良的软件架构, 应对软件从简单到复杂的过程。所以关注点在架构设计, 而不是发明工具, 因此尽量选择集成社区优秀的工具。  
:::


## 核心概念

框架采用面向对象的设计思想, 将整个程序的对象分为4类:
+ API: 接口对象, 负责对外提供接口, 现支持框架: Gin/GoRestful
+ Controller: 负责编写具体的业务逻辑, 如果业务非常简单, 且没有复用场景 可以考虑直接写在API对象内部
+ Config: 配置对象, 业务逻辑中共用的工具, 比如 数据库, kafka, redis之类
+ Default: 通用对象, 除了上面3中对象之外的其他对象, 预留区域，暂时未使用

这4类对象分别存储在4个区域(Namespace), 这4个区域共同组成的这个容器就叫Ioc分区容器:

![](/img/mcube/ioc_namespace.png)

其中 API和Controller区域的对象 需要应用开发者开发, 而Config区域的对象 由框架和社区开发

## 应用开发

下面演示一个简单应用的开发, 开发一个API 接口获取DB Stats, 要获取DB Stats, 只需要获取到DB的连接池对象, 调用Stats方法即可:
```go
db.Stats()
```

返回结果:
```json
{
  "data": {
    "MaxOpenConnections": 0,
    "OpenConnections": 1,
    "InUse": 0,
    "Idle": 1,
    "WaitCount": 0,
    "WaitDuration": 0,
    "MaxIdleClosed": 0,
    "MaxIdleTimeClosed": 0,
    "MaxLifetimeClosed": 0
    }
}
```

### 选择开发框架

Api对象支持2种框架:
+ Gin
+ GoRestful(v3)


### Object接口

无论使用那个框架，都需要实现Object接口, 只有实现了该接口，该对象才能被ioc空间管理:
```go
// Object接口, 需要注册到ioc空间托管的对象需要实现的方法
type Object interface {
  // 对象初始化, 初始化对象的属性
  Init() error
  // 对象的名称, 根据名称可以从空间中取出对象
  Name() string
  // 对象版本, 默认v1
  Version() string
  // 对象优先级, 根据优先级 控制对象初始化的顺序
  Priority() int
  // 对象的销毁, 服务关闭时调用
  Close(ctx context.Context) error
  // 是否允许同名对象被替换, 默认不允许被替换
  AllowOverwrite() bool
  // 对象一些元数据, 对象的更多描述信息, 扩展使用
  Meta() ObjectMeta
}
```


可用通过继承ObjectImpl对象 获取Object接口的默认实现, 然后按需进行覆写, 下面是我们设计的ApiHandler对象:
```go
import (
  "github.com/infraboard/mcube/v2/ioc"
)

type ApiHandler struct {
  // 继承自Ioc对象
  ioc.ObjectImpl
}
```

### 实现Object接口, 注册对象

通过继承已经实现了Object接口
```go
type ApiHandler struct {
	// 继承自Ioc对象
	ioc.ObjectImpl

	// db属性, gorm DB对象
	db *gorm.DB
}
```

覆写对象的名称, 默认为对象反射名称,比如: *main.ApiHandler
```go
// 覆写对象的名称, 该名称名称会体现在API的路径前缀里面
// 比如: /simple/api/v1/module_a/db_stats
// 其中/simple/api/v1/module_a 就是对象API前缀, 命名规则如下:
// <service_name>/<path_prefix>/<object_version>/<object_name>
func (h *ApiHandler) Name() string {
	return "module_a"
}
```

这样ApiHandler就实现了GinApiObject接口, 此时就可以把它注册到api区域了:
```go
import (
  "github.com/infraboard/mcube/v2/ioc"
)

func main() {
  // 注册HTTP接口类
  ioc.Api().Registry(&ApiHandler{})
  ...
}
```

### 对象初始化

现在ApiHandler的db属性还没初始化, 可以直接通过引入Datasource组件, 获取Gorm的db对象

```go
type ApiHandler struct {
	// 继承自Ioc对象
	ioc.ObjectImpl

	// db属性, gorm DB对象
	db *gorm.DB
}
```

要完成对象属性的初始化需要覆写Init()方法, mcube框架在启动时，会自动调用该方法来初始化对象
```go
// 初始化db属性, 从ioc的配置区域获取共用工具 gorm db对象
func (h *ApiHandler) Init() error {
	h.db = datasource.DB()

	// 进行业务暴露, router 通过ioc
	router := ioc_gin.RootRouter()
	router.GET("/db_stats", h.GetDbStats)
	return nil
}

// 业务功能
func (h *ApiHandler) GetDbStats(ctx *gin.Context) {
	db, _ := h.db.DB()
	ctx.JSON(http.StatusOK, gin.H{
		"data": db.Stats(),
	})
}
```

然后通过配置文件进行组件配置: etc/application.toml (后面启动时会制定配置文件读取路径)
```toml
[datasource]
host = "127.0.0.1"
port = 3306
username = "root"
password = "123456"
database = "test"
```

### 启动服务器

通过server.Run()启动服务:
```go
import (
  "github.com/infraboard/mcube/v2/ioc/server"
)

func main() {
	// 注册HTTP接口类
	ioc.Api().Registry(&ApiHandler{})

	// 开启配置文件读取配置
	server.DefaultConfig.ConfigFile.Enabled = true
	server.DefaultConfig.ConfigFile.Path = "etc/application.toml"

	// 启动应用
	err := server.Run(context.Background())
	if err != nil {
		panic(err)
	}
}
```

最后启动服务 可以看到api已经可以访问:
```sh
$ mcube/examples/simple ‹master*› » go run main.go
2024-01-04T21:48:48+08:00 INFO   ioc/server/server.go:74 > loaded configs: [app.v1 trace.v1 log.v1 datasource.v1 grpc.v1 http.v1] component:SERVER
2024-01-04T21:48:48+08:00 INFO   ioc/server/server.go:75 > loaded controllers: [] component:SERVER
2024-01-04T21:48:48+08:00 INFO   ioc/server/server.go:76 > loaded apis: [module_a.v1] component:SERVER
[GIN-debug] GET    /simple/api/v1/module_a/db_stats --> main.(*ApiHandler).Registry.func1 (3 handlers)
2024-01-04T21:48:48+08:00 INFO   config/http/http.go:211 > HTTP服务启动成功, 监听地址: 127.0.0.1:8020 component:HTTP
```

### 完整代码

完整[样例代码](https://github.com/infraboard/mcube/blob/master/examples/simple/main.go)
```go
package main

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/infraboard/mcube/v2/ioc"
	"github.com/infraboard/mcube/v2/ioc/config/datasource"
	ioc_gin "github.com/infraboard/mcube/v2/ioc/config/gin"
	"github.com/infraboard/mcube/v2/ioc/server"
	"gorm.io/gorm"

	// 开启Health健康检查
	_ "github.com/infraboard/mcube/v2/ioc/apps/health/gin"
	// 开启Metric
	_ "github.com/infraboard/mcube/v2/ioc/apps/metric/gin"
)

func main() {
	// 注册HTTP接口类
	ioc.Api().Registry(&ApiHandler{})

	// 开启配置文件读取配置
	server.DefaultConfig.ConfigFile.Enabled = true
	server.DefaultConfig.ConfigFile.Path = "etc/application.toml"

	// 启动应用
	err := server.Run(context.Background())
	if err != nil {
		panic(err)
	}
}

type ApiHandler struct {
	// 继承自Ioc对象
	ioc.ObjectImpl

	// mysql db依赖
	db *gorm.DB
}

// 覆写对象的名称, 该名称名称会体现在API的路径前缀里面
// 比如: /simple/api/v1/module_a/db_stats
// 其中/simple/api/v1/module_a 就是对象API前缀, 命名规则如下:
// <service_name>/<path_prefix>/<object_version>/<object_name>
func (h *ApiHandler) Name() string {
	return "module_a"
}

// 初始化db属性, 从ioc的配置区域获取共用工具 gorm db对象
func (h *ApiHandler) Init() error {
	h.db = datasource.DB()

	// 进行业务暴露, router 通过ioc
	router := ioc_gin.RootRouter()
	router.GET("/db_stats", h.GetDbStats)
	return nil
}

// 业务功能
func (h *ApiHandler) GetDbStats(ctx *gin.Context) {
	db, _ := h.db.DB()
	ctx.JSON(http.StatusOK, gin.H{
		"data": db.Stats(),
	})
}
```


## 工程化

有同学看到这里可能会十分不解, 上面这样简单的功能, 我几行代码就能搞定, 为啥要搞那么复杂:
```go
func main() {
  r := gin.Default()  
  dsn := "user:pass@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local"
  db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
  if err != nil {
  	panic(err)
  }
  r.GET("/simple/api/v1/module_a/db_stats", func(ctx *gin.Context) {
  	db, _ := db.DB()
  	ctx.JSON(http.StatusOK, gin.H{
  		"data": db.Stats(),
  	})
  })
}
```

针对简单的功能, 上面这样写固然没问题, 甚至更易读, 但是随着业务发展, 功能越来越多, 业务越来越复杂, 如果这样写, 到了后期基本无法维护。

想要业务从简单到复杂, 代码维护的复杂度不增加, 我们就需要对工程进行统一的设计, 提供统一的标准, 我们通过下面3个纬度体验mcube 工程化带来的好处:
+ 标准化工程配置
+ 即插即用的组件
+ 灵活的模块组合

### 标准化工程配置

统一了项目的配置加载方式:
+ 环境变量
+ 配置文件
    + TOML
	+ YAML
	+ JSON

下面是项目配置文件(etc/application.toml)内容: 
```toml
[app]
name = "simple"
key  = "this is your app key"

[http]
host = "127.0.0.1"
port = 8020

[datasource]
host = "127.0.0.1"
port = 3306
username = "root"
password = "123456"
database = "test"

[log]
level = "debug"

[log.file]
enable = true
file_path = "logs/app.log"
```

更多配置见左侧应用配置板块

### 即插即用的组件

通过简单的配置就能为项目添加:
+ 检查检查(Health Chcek)
+ 应用指标监控(Metric)

```go
import (
  // 开启Health健康检查
  _ "github.com/infraboard/mcube/v2/ioc/apps/health/gin"
  // 开启Metric
  _ "github.com/infraboard/mcube/v2/ioc/apps/metric/gin"
)
```

启动过后, 在日志里就能看到这2个功能开启了:
```sh
2024-01-05T11:30:00+08:00 INFO   health/gin/check.go:52 > Get the Health using http://127.0.0.1:8020/healthz component:HEALTH_CHECK
2024-01-05T11:30:00+08:00 INFO   metric/gin/metric.go:51 > Get the Metric using http://127.0.0.1:8020/metrics component:METRIC
```

当然你也可以通过配置来修改功能的URL路径:
```toml
[health]
  path = "/healthz"

[metric]
  enable = true
  provider = "prometheus"
  endpoint = "/metrics"
```

### 功能强大的模块

在服务开发的过程中，我们将一些通用功能打包成一个模块, 在项目中引入, 这样可以减少重复代码, 提高开发效率。

下面是一个IAM(身份与权限管理)模块: 
+ 管理管理接口
+ 令牌管理接口
+ 权限中间件
+ 初始化的CLI

![iam](/img/mcube/iam.png)


在程序启动时引入模块:
```go
import (
	// 引入IAM模块组件
	_ "github.com/infraboard/modules/iam"
	// 引入IAM模块CLI工具
	_ "github.com/infraboard/modules/iam/cmd"
)
```

然后初始化:
```sh
# 初始化管理员用户
$ modules/iam/example ‹main*› » go run main.go init                                                                               1 ↵
? 请输入管理员用户名称: admin
? 请输入管理员密码: ******
? 再次输入管理员密码: ******
```

在业务接口开发中，使用中间件 就引入的身份认证和RBAC鉴权
```go
// API路由
func (h *ApiHandler) Registry(r gin.IRouter) {
	r.Use(middleware.Auth())
	r.GET("/db_stats", middleware.Perm(user.ROLE_ADMIN), h.DBStats)
}
```

模块的具体使用文档可以参考: [IAM模块](https://github.com/infraboard/modules/tree/main/iam)