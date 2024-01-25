---
title: Server
sidebar_label: Server
---



## 启动服务

### 直接启动

```go
import (
    ...
    "github.com/infraboard/mcube/v2/ioc/server"
    ...
)

	// 启动应用
	err := server.Run(context.Background())
	if err != nil {
		panic(err)
	}
```

默认使用环境变量配置, 配置文件默认是关闭的, 也可以通过如下方式开启:
```go
func main() {
	server.DefaultConfig.ConfigFile.Enabled = true
	server.DefaultConfig.ConfigFile.Path = "etc/application.toml"
	err := server.Run(context.Background())
	if err != nil {
		panic(err)
	}
}
```

支持的配置方式:
+ 环境变量: 具体的参数见后面 服务配置 
+ 配置文件: 支持的格式有: TOML/YAML/JSON, 推荐使用TOML

这种写法比较适合于单入口程序, 比如 只需要启动Server, 但是如果你在启动Server之前需要做初始化喃？常见的场景就是 用户中心初始化管理员账号密码。

这就需要你的程序提供多个入口？ CLI启动就是用于这种场景的。

### CLI启动

cli集成的社区比较流行的CLI框架: [cobra](https://github.com/spf13/cobra)

框架默认实现了Root Cmd, 我们只需要把我们需要的cmd注册给Root Cmd即可实现多入口
```go
import (
  ...
  "github.com/infraboard/mcube/v2/ioc/server/cmd"
  ...
)

func main() {
	// 注册HTTP接口类
	ioc.Api().Registry(&ApiHandler{})

	cmd.Root.AddCommand(
		&cobra.Command{
			Use:   "start",
			Short: "example API服务",
			Run: func(cmd *cobra.Command, args []string) {
				cobra.CheckErr(server.Run(context.Background()))
			},
		},
		&cobra.Command{
			Use:   "init",
			Short: "初始化Admin用户名密码",
			Run: func(cmd *cobra.Command, args []string) {
				cobra.CheckErr(server.Run(context.Background()))
			},
		},
	)

	// 启动
	cmd.Execute()
}
```

运行后我们就可以看到有2个命令可用了:
+ start 命令
+ init 命令
```sh
$ go run main.go 
Usage:
  exapmle [flags]
  exapmle [command]

Available Commands:
  completion  Generate the autocompletion script for the specified shell
  help        Help about any command
  init        初始化Admin用户名密码
  start       example API服务

Flags:
  -f, --config-file string   the service config from file (default "etc/application.toml")
  -t, --config-type string   the service config type [file/env] (default "file")
  -h, --help                 help for exapmle
  -v, --version              the mcenter version

Use "exapmle [command] --help" for more information about a command.

$ go run main.go start
2024-01-25T12:22:36+08:00 INFO   ioc/server/server.go:74 > loaded configs: [app.v1 trace.v1 log.v1 datasource.v1 grpc.v1 http.v1] component:SERVER
2024-01-25T12:22:36+08:00 INFO   ioc/server/server.go:75 > loaded controllers: [tokens.v1 users.v1] component:SERVER
2024-01-25T12:22:36+08:00 INFO   ioc/server/server.go:76 > loaded apis: [tokens.v1 users.v1 module_a.v1] component:SERVER
...
```

## 服务配置

### 应用通用配置

```toml tab
[app]
  name = "mcube_app"
```

```env tab
APP_NAME="mcube_app"
```

### HTTP Server

```toml tab
[http]
  # 是否开启HTTP Server, 默认会根据是否有注册得有API对象来自动开启
  enable = false
  # HTTP服务Host
  host = "127.0.0.1"
  # HTTP服务端口
  port = 8010
  # API接口前缀
  path_prefix = "api"
  # 使用的http框架, 默认会根据当前注册的API对象,自动选择合适的框架
  web_framework = ""

  # HTTP服务器参数
  # HTTP Header读取超时时间
  read_header_timeout = 30
  # 读取HTTP整个请求时的参数
  read_timeout = 60
  # 响应超时时间
  write_timeout = 60
  # 启用了KeepAlive时 复用TCP链接的超时时间
  idle_timeout = 300
  # header最大大小
  max_header_size = "16kb"
  # 开启Trace
  enable_trace = false
```

```env tab
HTTP_ENABLE=false
HTTP_HOST="127.0.0.1"
HTTP_PORT=8010
HTTP_PATH_PREFIX="api"
HTTP_WEB_FRAMEWORK= “”

HTTP_READ_HEADER_TIMEOUT=30
HTTP_READ_TIMEOUT=60
HTTP_WRITE_TIMEOUT=60
HTTP_IDLE_TIMEOUT=300
HTTP_MAX_HEADER_SIZE="16kb"

HTTP_ENABLE_TRACE=false
HTTP_HEALTH_CHECK_ENABLED=true
```

### GRPC Server


```toml tab
[grpc]
  # 开启GRPC服务
  enable = false
  # Server监听的地址
  host = "127.0.0.1"
  # Server监听的端口
  port = 18010
  # 开启recovery恢复
  enable_recovery = true
  # 开启Trace
  enable_trace = true
```

```env tab
GRPC_ENABLE=false
GRPC_HOST="127.0.0.1"
GRPC_PORT=18010
GRPC_ENABLE_RECOVERY=true
GRPC_ENABLE_TRACE=true
```

## 启动Hooks

如果我们想要在服务启动之前做一些自定义逻辑比如:
+ 启动时 完成服务注册 停止时完成服务注销
+ 为web框架添加 认证中间件

### SetUp Hook

```go
package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/infraboard/mcube/v2/ioc/server"

	// 加载业务模块
	_ "github.com/infraboard/mcube/v2/examples/project/apps/helloworld/api"
	_ "github.com/infraboard/mcube/v2/examples/project/apps/helloworld/impl"
)

func main() {
	server.DefaultConfig.ConfigFile.Enabled = true
	server.DefaultConfig.ConfigFile.Path = "etc/application.toml"

	// 启动前 设置
	server.SetUp(func() {
      // 补充自定义Hook
	}).Run(context.Background())
}
```


:::danger 注意
如果使用到了ioc对象, 一定要放到setup函数中执行, 因为ioc的初始化在server启动内部
:::

### GRPC 服务Hook

```go

import (
  ...
  "github.com/infraboard/mcube/v2/ioc/config/grpc"
  ...
)

// 启动前 设置
server.SetUp(func() {
  // 开启GRPC服务注册与注销
  grpc.Get().PostStart = func(ctx context.Context) error {
    return nil
  }
  grpc.Get().PreStop = func(ctx context.Context) error {
    return nil
  }

  // 补充Grpc 中间件
  grpc.Get().AddInterceptors()
}).Run(context.Background())
```

### HTTP 服务Hook

#### 业务路由加载之前(BeforeLoad)

```go
import (
  ...
  ioc_http "github.com/infraboard/mcube/v2/ioc/config/http"
  ...
)

// 启动前 设置
server.SetUp(func() {
    // HTTP业务路由加载之前
    ioc_http.Get().RouterBuildConfig.BeforeLoad = func(r http.Handler) {
    // Gin框架
    if router, ok := r.(*restful.Container); ok {
      // GoRestful Router对象
      fmt.Println(router)
    }

    // GoRestful 框架
    if router, ok := r.(*gin.Engine); ok {
      // Gin Engine对象
      fmt.Println(router)
    }
    }
}).Run(context.Background())
```


#### 业务路由加载之后(AfterLoad)

```go
import (
  ...
  ioc_http "github.com/infraboard/mcube/v2/ioc/config/http"
  ...
)

// 启动前 设置
server.SetUp(func() {
    // HTTP业务路由加载之后
    ioc_http.Get().RouterBuildConfig.AfterLoad = func(r http.Handler) {
    // Gin框架
    if router, ok := r.(*restful.Container); ok {
      // GoRestful Router对象
      fmt.Println(router)
    }

    // GoRestful 框架
    if router, ok := r.(*gin.Engine); ok {
      // Gin Engine对象
      fmt.Println(router)
    }
    }
}).Run(context.Background())
```