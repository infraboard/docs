---
title: 快速开始
sidebar_label: 快速开始
---

下面将演示一个上图中 应用开发区的一个HelloWorld应用, 完整代码请参考: [样例代码](https://github.com/infraboard/mcube/tree/master/examples/project)


## 项目结构

```sh
# 查看文件列表
$ mcube/examples/project ‹master*› » ls 
apps    etc     main.go
# 查看目录结构
$ mcube/examples/project ‹master*› » tree .
.
|____etc
| |____application.toml
|____apps
| |____helloworld
| | |____impl
| | | |____collector.go
| | | |____impl.go
| | |____interface.go
| | |____api
| | | |____http.go
|____main.go
```

### 工程维度

+ etc: 配置文件目录, 默认为etc/application.toml
+ apps: 业务模块目录, 所有业务模块都存放在该目录下, 现在只有一个helloworld模块
+ main.go: 程序入口

### 业务维度

不同于传统的功能分层架构(mvc), 框架推荐采用业务分区布局, 这是为了方便后面进行微服务拆分, 具体见[渐进式微服务](./core/arch.md)

业务模块开发遵循如下规则:
+ 定义业务(Interface): 梳理需求, 抽象业务逻辑, 定义出业务的数据结构与接口约束
+ 业务实现(Controller): 根据业务定义, 选择具体的技术(比如MySQL/MongoDB/ES)，做具体的业务实现
+ 业务接口(API): 如果需要对外提供 API, 则按需将需要的对外暴露API接口

表现在目录结构上:
+ 定义业务: 业务模块顶层目录, 具体表现为: helloworld/interface.go(接口定义)
+ 业务实现: 业务模块内impl目录, 具体表现为: helloworld/impl/impl.go(业务实现对象)
+ 业务接口: 业务模块内api目录, 具体表现为: helloworld/api/http.go(HTTP Restful接口实现对象)
```sh
# helloworld业务模块 文件列表
$ project/apps/helloworld ‹master*› » ls
api          impl         interface.go
# helloworld业务模块 目录结构
$ project/apps/helloworld ‹master*› » tree .
.
|____impl            
| |____collector.go
| |____impl.go
|____interface.go    
|____api            
| |____http.go
```

### 整体设计

开发业务时，我们只需关注apps目录, 而其他很多功能由框架复杂提供, 因此框架工具 + 业务模块共同构成了整个项目:

![](/img/mcube/arch.png)


## 项目开发

### 定义业务

helloworld包
```go
// 1. 业务定义
type HelloService interface {
	Hello() string
}
```

### 实现业务

helloworld/impl包
```go
func init() {
	ioc.Controller().Registry(&HelloServiceImpl{})
}

// 业务逻辑实现类
type HelloServiceImpl struct {
	db *gorm.DB

	ioc.ObjectImpl
}

// 控制器初始化
func (i *HelloServiceImpl) Init() error {
	// 从Ioc总获取GORM DB对象, GORM相关配置已经托管给Ioc
	// Ioc会负责GORM的配置读取和为你初始化DB对象实例,以及关闭
	i.db = datasource.DB()
	return nil
}

// 具体业务逻辑
func (i *HelloServiceImpl) Hello() string {
	return "hello world"
}
```

### 暴露接口

定义Helloworl API接口: helloword/api包
```go
func init() {
	ioc.Api().Registry(&HelloServiceApiHandler{})
}

// 3. 暴露HTTP接口
type HelloServiceApiHandler struct {
	// 依赖业务控制器
	// 使用ioc注解来从自动加载依赖对象, 等同于手动执行:
	// 	h.svc = ioc.Controller().Get("*impl.HelloService").(helloworld.HelloService)
	Svc helloworld.HelloService `ioc:"autowire=true;namespace=controllers"`

	// 日志相关配置已经托管到Ioc中, 由于是私有属性，所有受到注入, 具体见下边初始化方法
	log *zerolog.Logger

	// 继承自Ioc对象
	ioc.ObjectImpl
}

// 对象自定义初始化
func (h *HelloServiceApiHandler) Init() error {
	h.log = log.Sub("helloworld.api")
	return nil
}

// API路由
func (h *HelloServiceApiHandler) Registry(r gin.IRouter) {
	r.GET("/", h.Hello)
}

// API接口具体实现
func (h *HelloServiceApiHandler) Hello(c *gin.Context) {
	// 业务处理
	resp := h.Svc.Hello()
	h.log.Debug().Msg(resp)

	// 业务响应
	c.JSON(http.StatusOK, gin.H{
		"data": resp,
	})
}
```

### 加载业务

启动服务: main
```go
package main

import (
	"context"

	// 非业务模块
	_ "github.com/infraboard/mcube/v2/ioc/apps/metric/gin"
	"github.com/infraboard/mcube/v2/ioc/server"

	// 加载业务模块
	_ "github.com/infraboard/mcube/v2/examples/project/apps/helloworld/api"
	_ "github.com/infraboard/mcube/v2/examples/project/apps/helloworld/impl"
)

func main() {
	server.DefaultConfig.ConfigFile.Enabled = true
	err := server.Run(context.Background())
	if err != nil {
		panic(err)
	}
}
```

### 启动程序

配置文件请参考: [程序配置](https://github.com/infraboard/mcube/blob/master/docs/example/etc/application.toml)
```sh
$ go run main.go 
2023-11-14T17:40:32+08:00 INFO   config/application/application.go:93 > loaded configs: [log.v1 app.v1 datasource.v1] component:APPLICATION
2023-11-14T17:40:32+08:00 INFO   config/application/application.go:94 > loaded controllers: [log.v1 app.v1 datasource.v1] component:APPLICATION
2023-11-14T17:40:32+08:00 INFO   config/application/application.go:95 > loaded apis: [*api.HelloServiceApiHandler.v1] component:APPLICATION
[GIN-debug] [WARNING] Creating an Engine instance with the Logger and Recovery middleware already attached.

[GIN-debug] [WARNING] Running in "debug" mode. Switch to "release" mode in production.
 - using env:   export GIN_MODE=release
 - using code:  gin.SetMode(gin.ReleaseMode)

[GIN-debug] GET    /exapmle/api/v1/          --> github.com/infraboard/mcube/docs/example/helloworld/api.(*HelloServiceApiHandler).Hello-fm (3 handlers)
2023-11-14T17:40:32+08:00 INFO   config/application/http.go:165 > HTTP服务启动成功, 监听地址: 127.0.0.1:8020 component:HTTP
```