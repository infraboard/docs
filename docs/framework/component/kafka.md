---
title: Kafka 使用
sidebar_label: Kafka 使用
---

kafka是Java写的, 官方并没有Go SDK, 但是社区有3款还不错的SDK可供选择

+ [confluent-kafka-go](https://github.com/confluentinc/confluent-kafka-go): 基于c库[librdkafka](https://github.com/edenhill/librdkafka)的封装, 文档不错, 但是不支持Go Context
+ [sarama](https://github.com/Shopify/sarama): 迄今为止最流行的一个库, 纯Go实现, 但是暴露的API偏低层(Kafka protocol), 使用手感欠佳, 也不支持Go Context
+ [kafka-go](https://github.com/segmentio/kafka-go): 新贵,借鉴了sarama,并且兼容Sarama, 纯Go实现, 代码质量也比之前2个库好, API的封装非常友好, 非常符合Go的编程习惯, 比如Context, Reader, Writer等

这里选择kafka-go

## 配置组件

```toml tab
[kafka]
  brokers = ["127.0.0.1:9092"]
  scram_algorithm = "SHA512"
  username = ""
  password = ""
  debug = false
```

```env tab
KAFKA_BROKERS="127.0.0.1:9092"
KAFKA_SCRAM_ALGORITHM="SHA512"
KAFKA_USERNAME=""
KAFKA_PASSWORD=""
KAFKA_DEBUG=false
```

## 基本使用

```go
package main

import (
	"fmt"

	"github.com/infraboard/mcube/v2/ioc/config/kafka"
)

func main() {
	// 消息生产者
	producer := kafka.Producer("test")
	fmt.Println(producer)

	// 消息消费者
	consumer := kafka.ConsumerGroup("group id", []string{"topic name"})
	fmt.Println(consumer)
}
```


## 样例演示

### 环境准备

这里环境采用Docker compose安装:

创建dock compose编排文件: docker-compose.yml
```yaml
version: '2'
services:
  zookeeper:
    image: wurstmeister/zookeeper
    restart: unless-stopped
    hostname: zookeeper
    ports:
      - "2181:2181"
    container_name: zookeeper

  kafka:
    image: wurstmeister/kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_ADVERTISED_HOST_NAME: localhost
      KAFKA_ZOOKEEPER_CONNECT: "zookeeper:2181"
      KAFKA_BROKER_ID: 1
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_CREATE_TOPICS: "stream-in:1:1,stream-out:1:1"
    depends_on:
      - zookeeper
    container_name: kafka
```

启动kafka服务

```
docker-compose up -d
```

