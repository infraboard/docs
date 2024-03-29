---
title: GRPC接口
sidebar_label: GRPC接口
---

下面是以一个grpc 的hello world为例演示


## 使用protobuf定义接口

关于如何定义protobuf和使用 请参考protobuf官方文档

```proto
syntax = "proto3";

package infraboard.mcube.example;
option go_package = "github.com/infraboard/mcube/v2/examples/rpc_grpc/pb";

// Hello world 样例
service Hello {
    rpc Greet(GreetRequest) returns(GreetResponse);
}

message GreetRequest {
    string name = 1;
}

message GreetResponse {
    string msg = 2;
}
```

## 实现GRPC服务端

包`github.com/infraboard/mcube/v2/ioc/config/grpc`提供了全局GRPC Server对象
+ grpc.Get().Server(): 获取Server对象

实现完GRPC Server对象后，只需要将对象注册给Server及可通过grpc server对我暴露GRPC服务了

定义HelloGrpc对象: 

```go
package (
	"github.com/infraboard/mcube/v2/ioc/config/grpc"
)

type HelloGrpc struct {
	// 继承自Ioc对象
	ioc.ObjectImpl
	// 集成Grpc Server对象
	pb.UnimplementedHelloServer
}

func (h *HelloGrpc) Name() string {
	return "hello_module"
}

func (h *HelloGrpc) Init() error {
	pb.RegisterHelloServer(grpc.Get().Server(), h)
	return nil
}
```

实现GRPC服务
```go
func (h *HelloGrpc) Greet(ctx context.Context, in *pb.GreetRequest) (*pb.GreetResponse, error) {
	return &pb.GreetResponse{
		Msg: fmt.Sprintf("hello, %s", in.Name),
	}, nil
}
```


## 注册GRPC对象

GRPC是属于服务端控制器, 需要注册到控制器空间

```go
// 注册HTTP接口类
ioc.Controller().Registry(&HelloGrpc{})
```

##  启动服务

```go
// 启动应用
err := server.Run(context.Background())
if err != nil {
	panic(err)
}
```

可以看到grpc的对象 hello_module.v1 已经注册, 并且服务监听在127.0.0.1:18080
```go
$ Golang/inforboard/mcube ‹master*› » go run examples/rpc_grpc/server/main.go 
2023-12-18T15:27:03+08:00 INFO   config/application/application.go:106 > loaded configs: [log.v1 app.v1] component:APPLICATION
2023-12-18T15:27:03+08:00 INFO   config/application/application.go:107 > loaded controllers: [hello_module.v1] component:APPLICATION
2023-12-18T15:27:03+08:00 INFO   config/application/application.go:108 > loaded apis: [] component:APPLICATION
2023-12-18T15:27:03+08:00 INFO   config/application/grpc.go:119 > GRPC 服务监听地址: 127.0.0.1:18080 component:GRPC
```

## 编写客户端并进行测试

编写客户端
```go
func main() {
	// 连接到服务
	conn, err := grpc.Dial(
		"127.0.0.1:18080",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		panic(err)
	}

	resp, err := pb.NewHelloClient(conn).Greet(context.Background(), &pb.GreetRequest{
		Name: "old yu",
	})
	if err != nil {
		panic(err)
	}
	fmt.Println(resp)
}
```

进行测试
```sh
$ Golang/inforboard/mcube ‹master*› » go run examples/rpc_grpc/client/main.go                                                                                            1 ↵
msg:"hello, old yu"
```

完整的例子请查看: [gin](https://github.com/infraboard/mcube/blob/master/examples/rpc_grpc)