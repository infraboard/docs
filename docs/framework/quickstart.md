---
title: 快速开始
sidebar_label: 快速开始
slug: /docs/framework/quickstart
---

下面将演示一个上图中 应用开发区的一个HelloWorld应用, 完整代码请参考: [样例代码](./docs/example/)


## 定义Hello业务: helloworld包
```go
// 1. 业务定义
type HelloService interface {
	Hello() string
}
```

## 实现Hello业务: helloworld/impl包
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

## 定义Helloworl API接口: helloword/api包
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
	h.log = logger.Sub("helloworld.api")
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

## 加载业务包 启动服务: main
```go
import (
    ...
	// 加载业务模块
	_ "github.com/infraboard/mcube/docs/example/helloworld/api"
	_ "github.com/infraboard/mcube/docs/example/helloworld/impl"
)

func main() {
	req := ioc.NewLoadConfigRequest()
    // 配置文件默认路径: etc/applicaiton.toml
	req.ConfigFile.Enabled = true
	err := ioc.ConfigIocObject(req)
	if err != nil {
		panic(err)
	}

	// 启动应用, 应用会自动加载 刚才实现的Gin Api Handler
	err = application.App().Start(context.Background())
	if err != nil {
		panic(err)
	}
}
```

## 启动程序, 配置文件请参考: [程序配置](./docs/example/etc/application.toml)
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