---
title: HTTP接口
sidebar_label: HTTP接口
---

Go语言当下最流行的一些Web编程框架:
+ [Gin](https://github.com/gin-gonic/gin): 高性能、灵活的路由和中间件支持，适合构建高并发的RESTful API
+ [Go-Restful](https://github.com/emicklei/go-restful): 专注于RESTful风格的API，强调资源管理和可扩展性
+ [Echo](https://github.com/labstack/echo): 轻量级、高性能，支持丰富的中间件和灵活的路由
+ [Beego](https://github.com/beego/beego): 全栈框架，包含MVC、RESTful支持和自动化工具，适合快速开发

这里选择支持当下最流行的2种 Restful 的高性能轻量级框架:
+ Gin
+ GoRestful(v3)

总的来说，Go语言的Web框架各有特点，开发者可以根据项目需求选择合适的框架。 

## Gin框架

框架通过"github.com/infraboard/mcube/v2/ioc/config/gin"包提供了Gin的Router对象
+ RootRouter(): 返回一个*gin.Engine
+ ObjectRouter(obj ioc.Object): 返回一个子Router: gin.IRouter

基于此，我们可以在对象初始化的时候完成:
+ 业务路由的注册: router.Handle()
+ 业务中间件的加载: router.Use()

### 实现接口

下面是一个hello world 样例 HelloServiceApiHandler 实现了GinApiObject接口:
```go

import (
	// 引入Gin Root Router: *gin.Engine
	ioc_gin "github.com/infraboard/mcube/v2/ioc/config/gin"
)

type HelloServiceApiHandler struct {
	// 继承自Ioc对象
	ioc.ObjectImpl
}

// 模块的名称, 会作为路径的一部分比如: /mcube_service/api/v1/hello_module/
// 路径构成规则 <service_name>/<path_prefix>/<service_version>/<module_name>
func (h *HelloServiceApiHandler) Name() string {
	return "hello_module"
}

func (h *HelloServiceApiHandler) Version() string {
	return "v1"
}

// API路由注册
func (h *HelloServiceApiHandler) Init() error {
	// 该对象的系统前缀: /service_name/path_prefix/object_version/object_name
	// service_name 默认为""
	// /api/v1/hello_module/
	r := ioc_gin.ObjectRouter(h)
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"data": "hello mcube",
		})
	})
	return nil
}
```

### 注册接口对象

```go
// 注册HTTP接口类
ioc.Api().Registry(&HelloServiceApiHandler{})
```

### 启动服务

```go
// 启动应用
err := server.Run(context.Background())
if err != nil {
	panic(err)
}
```

启动后
```sh
$ inforboard/mcube/examples ‹master› » go run http_gin/main.go
[GIN-debug] [WARNING] Creating an Engine instance with the Logger and Recovery middleware already attached.

[GIN-debug] [WARNING] Running in "debug" mode. Switch to "release" mode in production.
 - using env:   export GIN_MODE=release
 - using code:  gin.SetMode(gin.ReleaseMode)

2024-03-15T11:44:17+08:00 INFO   cors/gin/cors.go:53 > cors enabled component:CORS
[GIN-debug] GET    /api/v1/hello_module/     --> main.(*HelloServiceApiHandler).Hello-fm (4 handlers)
2024-03-15T11:44:17+08:00 INFO   ioc/server/server.go:74 > loaded configs: [app.v1 trace.v1 log.v1 gin_webframework.v1 gin_cors.v1 http.v1 grpc.v1] component:SERVER
2024-03-15T11:44:17+08:00 INFO   ioc/server/server.go:75 > loaded controllers: [] component:SERVER
2024-03-15T11:44:17+08:00 INFO   ioc/server/server.go:76 > loaded apis: [health.v1 metric.v1 hello_module.v1 apidoc.v1] component:SERVER
2024-03-15T11:44:17+08:00 INFO   config/http/http.go:141 > HTTP服务启动成功, 监听地址: 127.0.0.1:8080 component:HTTP
```

完整的例子请查看: [gin](https://github.com/infraboard/mcube/blob/master/examples/http_gin/main.go)

## GoRestful框架

框架通过"github.com/infraboard/mcube/v2/ioc/config/gorestful"包提供了Gin的Router对象
+ RootRouter(): 返回一个*restful.Container
+ ObjectRouter(obj ioc.Object): 返回一个WebService: *restful.WebService

基于此，我们可以在对象初始化的时候完成:
+ 业务路由的注册: router.Route().To()
+ 业务中间件的加载: router.Filter()

### 实现接口

```go
import (
	"github.com/infraboard/mcube/v2/ioc/config/gorestful"
)

type HelloServiceApiHandler struct {
	// 继承自Ioc对象
	ioc.ObjectImpl
}

// 模块的名称, 会作为路径的一部分比如: /mcube_service/api/v1/hello_module/
// 路径构成规则 <service_name>/<path_prefix>/<service_version>/<module_name>
func (h *HelloServiceApiHandler) Name() string {
	return "hello_module"
}

func (h *HelloServiceApiHandler) Version() string {
	return "v1"
}

// API路由
func (h *HelloServiceApiHandler) Init() error {
	ws := gorestful.ObjectRouter(h)
	ws.Route(ws.GET("/").To(func(r *restful.Request, w *restful.Response) {
		w.WriteAsJson(map[string]string{
			"data": "hello mcube",
		})
	}))
}
```

### 注册接口对象

```go
// 注册HTTP接口类
ioc.Api().Registry(&HelloServiceApiHandler{})
```

### 启动服务

```go
// 启动应用
err := server.Run(context.Background())
if err != nil {
	panic(err)
}
```

通过 API Doc的链接 可以查看当前注册的接口:
```sh
$ inforboard/mcube/examples ‹master› » go run http_go_restful/main.go 
2024-03-15T11:59:51+08:00 INFO   cors/gorestful/cors.go:52 > cors enabled component:CORS
2024-03-15T11:59:51+08:00 INFO   metric/restful/metric.go:58 > Get the Metric using http://127.0.0.1:8080/metrics component:METRIC
2024-03-15T11:59:51+08:00 INFO   health/restful/check.go:62 > Get the Health using http://127.0.0.1:8080/healthz component:HEALTH_CHECK
2024-03-15T11:59:51+08:00 INFO   apidoc/restful/swagger.go:55 > Get the API Doc using http://127.0.0.1:8080/api/v1/apidoc component:API_DOC
2024-03-15T11:59:51+08:00 INFO   ioc/server/server.go:74 > loaded configs: [app.v1 trace.v1 log.v1 go_restful_webframework.v1 go_restful_cors.v1 http.v1 grpc.v1] component:SERVER
2024-03-15T11:59:51+08:00 INFO   ioc/server/server.go:75 > loaded controllers: [] component:SERVER
2024-03-15T11:59:51+08:00 INFO   ioc/server/server.go:76 > loaded apis: [metric.v1 health.v1 hello_module.v1 apidoc.v1] component:SERVER
2024-03-15T11:59:51+08:00 INFO   config/http/http.go:141 > HTTP服务启动成功, 监听地址: 127.0.0.1:8080 component:HTTP
```

完整的例子请查看: [gin](https://github.com/infraboard/mcube/blob/master/examples/http_go_restful/main.go)


