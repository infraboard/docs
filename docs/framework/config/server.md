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

	// 启动
	cmd.Start()
}
```

运行后我们就可以看到有1个命令可用了:
+ start 命令
```sh
$ go run main.go start
Usage:
  cmdb [flags]
  cmdb [command]

Available Commands:
  completion  Generate the autocompletion script for the specified shell
  help        Help about any command
  start       启动服务

Flags:
  -f, --config-file string   the service config from file (default "etc/application.toml")
  -t, --config-type string   the service config type [file/env] (default "file")
  -h, --help                 help for this command
  -v, --version              the service version

Use "cmdb [command] --help" for more information about a command.
```

## 服务配置

### 应用通用配置

```toml tab
[app]
  name = "mcube_app"
  description = "app desc"
  address = "localhost"
  encrypt_key = "defualt app encrypt key"
```

```env tab
APP_NAME="mcube_app"
APP_DESCRIPTION="app desc"
APP_ADDRESS="localhost"
APP_ENCRYPT_KEY="defualt app encrypt key"
```

### HTTP Server

```toml tab
[http]
  # 是否开启HTTP Server, 默认会根据是否有注册得有API对象来自动开启
  enable = true
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

HTTP_HEALTH_CHECK_ENABLED=true
```

### GRPC Server

```toml tab
[grpc]
  # 开启GRPC服务
  enable = true
  # Server监听的地址
  host = "127.0.0.1"
  # Server监听的端口
  port = 18010
  # 开启recovery恢复
  recovery = true
  # 开启Trace
  trace = true
```

```env tab
GRPC_ENABLE=false
GRPC_HOST="127.0.0.1"
GRPC_PORT=18010
GRPC_RECOVERY=true
GRPC_TRACE=true
```