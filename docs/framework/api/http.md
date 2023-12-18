---
title: HTTP接口
sidebar_label: HTTP接口
---

支持的Web框架:
+ Gin
+ GoRestful(v3)

## Gin框架

### GinApiObject接口

要编写一个Gin HTTP API模块, 你需要实现接口: GinApiObject
```go
type GinApiObject interface {
	Object
	Registry(gin.IRouter)
}
```

### 实现接口

下面是一个hello world 样例 HelloServiceApiHandler 实现了GinApiObject接口:
```go
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
func (h *HelloServiceApiHandler) Registry(r gin.IRouter) {
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"data": "hello mcube",
		})
	})
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
err = application.App().Start(context.Background())
if err != nil {
    panic(err)
}
```

启动后
```sh
$ inforboard/mcube/examples ‹master*› » go run api.go                                                                                                                    1 ↵
2023-12-14T19:11:40+08:00 INFO   config/application/application.go:103 > loaded configs: [trace.v1 log.v1 app.v1] component:APPLICATION
2023-12-14T19:11:40+08:00 INFO   config/application/application.go:104 > loaded controllers: [] component:APPLICATION
2023-12-14T19:11:40+08:00 INFO   config/application/application.go:105 > loaded apis: [hello_module.v1] component:APPLICATION
[GIN-debug] [WARNING] Creating an Engine instance with the Logger and Recovery middleware already attached.

[GIN-debug] [WARNING] Running in "debug" mode. Switch to "release" mode in production.
 - using env:   export GIN_MODE=release
 - using code:  gin.SetMode(gin.ReleaseMode)

[GIN-debug] GET    /mcube_service/api/v1/hello_module/ --> main.(*HelloServiceApiHandler).Registry.func1 (3 handlers)
2023-12-14T19:11:40+08:00 INFO   config/application/http.go:205 > HTTP服务启动成功, 监听地址: 127.0.0.1:8080 component:HTTP
```

完整的例子请查看: [gin](https://github.com/infraboard/mcube/blob/master/examples/http_gin/main.go)

## GoRestful框架


### GoRestfulApiObject接口

要编写一个Go Restful HTTP API模块, 你需要实现接口: GoRestfulApiObject
```go
type GoRestfulApiObject interface {
	Object
	Registry(*restful.WebService)
}
```

### 实现接口

```go
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
func (h *HelloServiceApiHandler) Registry(ws *restful.WebService) {
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
err = application.App().Start(context.Background())
if err != nil {
    panic(err)
}
```

通过 API Doc的链接 可以查看当前注册的接口:
```go
$ inforboard/mcube/examples ‹master› » go run http_go_restful/main.go 
2023-12-18T11:34:52+08:00 INFO   config/application/application.go:106 > loaded configs: [log.v1 app.v1] component:APPLICATION
2023-12-18T11:34:52+08:00 INFO   config/application/application.go:107 > loaded controllers: [] component:APPLICATION
2023-12-18T11:34:52+08:00 INFO   config/application/application.go:108 > loaded apis: [hello_module.v1] component:APPLICATION
2023-12-18T11:34:52+08:00 INFO   config/application/http_gorestful.go:79 > Get the API Doc using http://127.0.0.1:8080/apidocs.json component:GO-RESTFUL
2023-12-18T11:34:52+08:00 INFO   config/application/http_gorestful.go:86 > 健康检查地址: http://127.0.0.1:8080/healthz component:GO-RESTFUL
2023-12-18T11:34:52+08:00 INFO   config/application/http.go:236 > HTTP服务启动成功, 监听地址: 127.0.0.1:8080 component:HTTP
```

完整的例子请查看: [gin](https://github.com/infraboard/mcube/blob/master/examples/http_go_restful/main.go)
