---
title: Nats 使用
sidebar_label: Nats 使用
---

消息队列Kafka比较重, 而且官方也在逐渐放弃zk, 转向raft, 如果想要在性能和灵活性上有所有选择，不妨考虑下NATS和NSQ, 他们都是现代分布式系统中广泛使用的消息传递系统, 这里我选择NATS, 如果对选型感兴趣可以看后面选型部份

## 配置组件

```toml tab
[nats]
  url = "nats://127.0.0.1:4222"
  token = ""
```

```env tab
NATS_URL="nats://127.0.0.1:4222"
NATS_TOEKN=""
```

## 基本使用

```go
import (
	"testing"
	"time"

	"github.com/infraboard/mcube/v2/ioc"
	ioc_nats "github.com/infraboard/mcube/v2/ioc/config/nats"
	"github.com/nats-io/nats.go"
)

const (
	TEST_SUBJECT = "event_bus"
)

func TestPublish(t *testing.T) {
	err := ioc_nats.Get().Publish(TEST_SUBJECT, []byte("test"))
	if err != nil {
		t.Fatal(err)
	}

	err = ioc_nats.Get().Flush()
	if err != nil {
		t.Fatal(err)
	}
}

func TestSub(t *testing.T) {
	_, err := ioc_nats.Get().Subscribe(TEST_SUBJECT, func(msg *nats.Msg) {
		t.Log(string(msg.Data))
	})
	if err != nil {
		t.Fatal(err)
	}

	time.Sleep(30 * time.Second)
}

func init() {
	err := ioc.ConfigIocObject(ioc.NewLoadConfigRequest())
	if err != nil {
		panic(err)
	}
}
```

## 选型

[NATS](https://nsq.io/)是一个开源、轻量级、高性能的分布式消息通信系统，由Apcera公司开发并开源。它采用Go语言编写，设计目标是实现"高性能(fast)、高可用(dial tone)、轻量级(small footprint)"13。NATS强调极简主义，提供最基本的消息传递功能，追求极致的性能和低延迟。它支持三种消息模式：发布/订阅(Publish/Subscribe)、请求/响应(Request/Reply)和队列(Queueing)3。

[NSQ](https://nats.io/)同样是一个基于Go语言的分布式实时消息平台，由bitly公司开源。NSQ的设计目标是为分布式环境提供一个去中心化的服务架构，能够每天处理数十亿条消息26。与NATS不同，NSQ更注重消息的可靠传递和易用性，提供了内置的消息持久化、管理界面等特性，适合需要更高可靠性的场景。

# NATS vs NSQ 核心特性对比

## 1. 基本特性对比

| **特性**               | **NATS**                                | **NSQ**                                |
|------------------------|-----------------------------------------|----------------------------------------|
| **消息传递语义**       | 最多一次（默认），NATS Streaming提供至少一次 | 至少一次                              |
| **持久化支持**         | 需NATS Streaming模块支持                | 内置支持（内存+磁盘）                 |
| **消息顺序**           | 不保证                                  | 不保证                                |
| **集群支持**           | 原生支持集群和超级集群                  | 通过`nsqlookupd`实现服务发现          |
| **管理界面**           | 简单监控界面                           | 提供功能完善的Web管理界面`nsqadmin`   |
| **消息大小限制**       | 1MB                                    | 可配置，默认较小                      |
| **安全特性**           | 2.0支持多租户和TLS                     | 早期版本无鉴权，新版有所改进          |

## 2. 性能对比

| **指标**               | **NATS**                     | **NSQ**                     |
|------------------------|------------------------------|-----------------------------|
| **吞吐量**             | 每秒8-11百万条消息（Go版本） | 每天可处理数十亿条消息      |
| **延迟**               | 极低延迟（小于1毫秒）        | 低延迟，适合实时消息        |
| **资源占用**           | 轻量级（Docker镜像仅3MB）    | 内存+磁盘混合模式           |

## 3. 使用场景对比

| **场景**               | **NATS适用场景**             | **NSQ适用场景**             |
|------------------------|------------------------------|-----------------------------|
| **微服务通信**         | 高性能、低延迟的微服务通信总线 | 简单可靠的消息队列          |
| **物联网（IoT）**      | 支持叶节点，适合边缘计算      | 可用于设备数据采集          |
| **实时数据分析**       | 低延迟传输，适合金融交易      | 日志和事件处理              |
| **云原生集成**         | CNCF项目，Kubernetes集成良好  | 部署简单，适合快速迭代      |

## 4. 可扩展性对比

| **扩展能力**           | **NATS**                     | **NSQ**                     |
|------------------------|------------------------------|-----------------------------|
| **水平扩展**           | 支持超级集群，全球分布式部署  | 支持无缝添加节点            |
| **高可用性**           | 集群模式支持故障转移          | 去中心化设计，无单点故障    |
| **动态扩容**           | 支持叶节点扩展边缘网络        | 通过`nsqlookupd`动态发现节点|



### 关键结论

+ 选择NATS：适用于需要极低延迟、高性能通信的场景，如微服务、IoT和金融交易159。
+ 选择NSQ：适用于简单可靠的消息队列需求，如日志处理、数据管道和初创项目

NSQ的的场景 没kafka做得好, 因此这里便想要选择灵活强性能强的 NATS