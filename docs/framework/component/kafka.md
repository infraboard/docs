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

```go
package kafka_test

import (
	"context"
	"fmt"
	"log"
	"net"
	"strconv"
	"testing"

	"github.com/segmentio/kafka-go"
)

// TestListTopics tests listing Kafka topics using the kafka-go library.
// maudit_new
// stream-out
// maudit
func TestListTopics(t *testing.T) {
	conn, err := kafka.Dial("tcp", "localhost:9092")
	if err != nil {
		panic(err.Error())
	}
	defer conn.Close()

	partitions, err := conn.ReadPartitions()
	if err != nil {
		panic(err.Error())
	}

	m := map[string]struct{}{}

	for _, p := range partitions {
		m[p.Topic] = struct{}{}
	}
	for k := range m {
		fmt.Println(k)
	}
}

// TestCreateTopic tests the creation of a Kafka topic using the kafka-go library.
func TestCreateTopic(t *testing.T) {
	conn, err := kafka.Dial("tcp", "localhost:9092")
	if err != nil {
		panic(err.Error())
	}
	defer conn.Close()

	controller, err := conn.Controller()
	if err != nil {
		panic(err.Error())
	}
	var controllerConn *kafka.Conn
	controllerConn, err = kafka.Dial("tcp", net.JoinHostPort(controller.Host, strconv.Itoa(controller.Port)))
	if err != nil {
		panic(err.Error())
	}
	defer controllerConn.Close()

	err = controllerConn.CreateTopics(kafka.TopicConfig{Topic: "test_topic", NumPartitions: 3, ReplicationFactor: 1})

	if err != nil {
		t.Fatal(err)
	}
}

// TestWriteMessage tests writing messages to a Kafka topic using the kafka-go library.
// kafka.Writer
func TestWriteMessage(t *testing.T) {
	// make a writer that produces to topic-A, using the least-bytes distribution
	publisher := &kafka.Writer{
		Addr: kafka.TCP("localhost:9092"),
		// NOTE: When Topic is not defined here, each Message must define it instead.
		Topic:    "test_topic",
		Balancer: &kafka.LeastBytes{},
		// The topic will be created if it is missing.
		AllowAutoTopicCreation: true,
		// 支持消息压缩
		// Compression: kafka.Snappy,
		// 支持TLS
		// Transport: &kafka.Transport{
		//     TLS: &tls.Config{},
		// }
	}
	defer publisher.Close()

	err := publisher.WriteMessages(context.Background(),
		kafka.Message{
			// 支持 Writing to multiple topics
			//  NOTE: Each Message has Topic defined, otherwise an error is returned.
			// Topic: "topic-A",
			Key:   []byte("Key-A"),
			Value: []byte("Hello World!"),
		},
		kafka.Message{
			Key:   []byte("Key-B"),
			Value: []byte("One!"),
		},
		kafka.Message{
			Key:   []byte("Key-C"),
			Value: []byte("Two!"),
		},
	)

	if err != nil {
		log.Fatal("failed to write messages:", err)
	}

}

// TestReadMessage tests reading messages from a Kafka topic using the kafka-go library.
func TestReadMessage(t *testing.T) {
	// make a new reader that consumes from topic-A
	subscriber := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{"localhost:9092"},
		// Consumer Groups, 不指定就是普通的一个Consumer
		GroupID: "devcloud",
		// 可以指定Partition消费消息
		// Partition: 0,
		Topic:    "task_run_events",
		MinBytes: 10e3, // 10KB
		MaxBytes: 10e6, // 10MB
	})
	defer subscriber.Close()

	for {
		// subscriber.FetchMessage(context.Background())
		m, err := subscriber.ReadMessage(context.Background())
		if err != nil {
			break
		}
		fmt.Printf("message at topic/partition/offset %v/%v/%v: %s = %s\n", m.Topic, m.Partition, m.Offset, string(m.Key), string(m.Value))

		// 处理完消息后需要提交该消息已经消费完成, 消费者挂掉后保存消息消费的状态
		// if err := r.CommitMessages(ctx, m); err != nil {
		//     log.Fatal("failed to commit messages:", err)
		// }
	}
}
```

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

