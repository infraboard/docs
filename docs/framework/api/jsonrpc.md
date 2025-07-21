---
title: JsonRPC
sidebar_label: JsonRPC
---

##  默认配置

```toml tab
[jsonrpc]
  # 是否开启HTTP Server, 默认会根据是否有注册得有API对象来自动开启
  enable = true
  # HTTP服务Host
  host = "127.0.0.1"
  # HTTP服务端口
  port = 9090
  # API接口前缀
  path_prefix = "jsonrpc"
```

```env tab
JSONRPC_ENABLE=false
JSONRPC_HOST="127.0.0.1"
JSONRPC_PORT=9090
JSONRPC_PATH_PREFIX="jsonrpc"
```

## 基本使用

### Service定义

service接口定义:
```go
const (
	APP_NAME = "HelloService"
)

type HelloService interface {
	Hello(request *HelloRequest, response *HelloResponse) error
}

type HelloRequest struct {
	MyName string `json:"my_name"`
}

type HelloResponse struct {
	Message string `json:"message"`
}
```

service 客户端
```go
package service

import (
	"fmt"

	"github.com/infraboard/mcube/v2/exception"
	"github.com/infraboard/mcube/v2/ioc/config/application"
	"github.com/infraboard/mcube/v2/ioc/config/jsonrpc"
	"resty.dev/v3"
)

func NewClient(address string) (HelloService, error) {
	// 建立TCP连接
	client := resty.New().
		SetDebug(application.Get().Debug).
		SetHeader("Content-Type", "application/json").
		SetHeader("Accept", "application/json").
		SetBaseURL(address).AddResponseMiddleware(func(c *resty.Client, r *resty.Response) error {
		if r.StatusCode()/100 != 2 {
			return exception.NewApiExceptionFromString(r.String())
		}
		return nil
	})
	return &HelloServiceClient{client: client}, nil
}

// 要封装原始的 不友好的rpc call
type HelloServiceClient struct {
	client *resty.Client
}

func (c *HelloServiceClient) Hello(in *HelloRequest, out *HelloResponse) error {
	body := jsonrpc.NewRequest(fmt.Sprintf("%s.Hello", APP_NAME), in)
	result := jsonrpc.NewResponse(body.Id, out)
	_, err := c.client.R().SetDebug(true).SetBody(body).SetResult(result).Post("")
	if err != nil {
		return err
	}

	if result.Error != nil {
		return exception.NewApiExceptionFromString(*result.Error)
	}
	return nil
}
```

### Server实现

```go
package main

import (
	"github.com/infraboard/mcube/v2/examples/jsonrpc/service"
	"github.com/infraboard/mcube/v2/ioc/config/jsonrpc"
	"github.com/infraboard/mcube/v2/ioc/server/cmd"
)

var _ service.HelloService = (*HelloServiceServer)(nil)

// 实现业务功能
// req := &HelloRequest{}
// resp := &HelloResponse{}
// err := &HelloServiceServer{}.Hello(req, resp)
// net/rpc
// 1. 写好的对象， 注册给RPC Server
// 2. 再把RPC Server 启动起来
type HelloServiceServer struct {
}

// HTTP Handler
func (h *HelloServiceServer) Hello(request *service.HelloRequest, response *service.HelloResponse) error {
	response.Message = "hello:" + request.MyName
	return nil
}

func main() {
	// 注册服务
	err := jsonrpc.GetService().Registry(service.APP_NAME, &HelloServiceServer{})
	if err != nil {
		panic(err)
	}

	cmd.Start()
}
```

### 客户端使用

```go
package main

import (
	"fmt"

	"github.com/infraboard/mcube/v2/examples/jsonrpc/service"
)

func main() {
	// 1. 通过网络调用 服务端的函数(RPC)
	// 建立网络连接
	client, err := service.NewClient("http://127.0.0.1:9090/jsonrpc/mcube_app")
	if err != nil {
		panic(err)
	}
	// 方法调用
	// serviceMethod string, args any, reply any
	req := &service.HelloRequest{
		MyName: "bob",
	}
	resp := &service.HelloResponse{}
	if err := client.Hello(req, resp); err != nil {
		panic(err)
	}

	fmt.Println("xxx", resp.Message)
}
```