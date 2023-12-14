---
title: HTTP接口
sidebar_label: HTTP接口
---

支持的Web框架:
+ Gin
+ GoRestful(v3)

## Gin

要编写一个Gin HTTP API模块, 你需要实现接口: GinApiObject
```go
type GinApiObject interface {
	Object
	Registry(gin.IRouter)
}
```

下面是一个hello world 样例:
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

接下来你需要做的仅仅是把改对象注册到ioc框架内:
```go
// 注册HTTP接口类
ioc.Api().Registry(&HelloServiceApiHandler{})
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

完整的例子请查看: [gin](https://github.com/infraboard/mcube/blob/master/examples/http_gin.go)

## GoRestful