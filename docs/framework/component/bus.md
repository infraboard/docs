---
title: 消息总线
sidebar_label: 消息总线
---

当前支持的消息总线类型:
+ kafka
+ nats
+ rabbitmq

## 配置组件

```toml tab
无
```

```env tab
无
```

## 基本使用

### 基于nats

基于nats的消息总线, 导入nats驱动即可, nats具体配置 见nats组件
```go
import (
    // nats总线
	_ "github.com/infraboard/mcube/v2/ioc/config/bus/nats"
)
```

具体样例
```go
import (
	"context"
	"fmt"
	"time"

	"github.com/infraboard/mcube/v2/ioc/config/bus"
	// nats总线
	_ "github.com/infraboard/mcube/v2/ioc/config/bus/nats"

	"github.com/infraboard/mcube/v2/ioc"
	"github.com/infraboard/mcube/v2/ioc/server"
)

const (
	TEST_SUBJECT = "event_bus"
)

func main() {
	ioc.DevelopmentSetup()

	// 消息生产者
	bus.GetService().TopicSubscribe(context.Background(), TEST_SUBJECT, func(e *bus.Event) {
		fmt.Println(string(e.Data))
	})

	// 发布消息
	go func() {
		for {
			time.Sleep(1 * time.Second)
			err := bus.GetService().Publish(context.Background(), &bus.Event{
				Subject: TEST_SUBJECT,
				Data:    []byte("test"),
			})
			if err != nil {
				fmt.Println(err)
			}
		}
	}()

	// 消息消费者
	// 启动应用
	err := server.Run(context.Background())
	if err != nil {
		panic(err)
	}
}
```

### 基于kafka

基于kafka的消息总线, 导入kafka驱动即可, nats具体配置 见kafka组件
```go
import (
    // kafka总线
	_ "github.com/infraboard/mcube/v2/ioc/config/bus/kafka"
)
```

具体样例
```go
package main

import (
	"context"
	"fmt"
	"time"

	"github.com/infraboard/mcube/v2/ioc/config/bus"
	// kafka总线
	_ "github.com/infraboard/mcube/v2/ioc/config/bus/kafka"

	"github.com/infraboard/mcube/v2/ioc"
	"github.com/infraboard/mcube/v2/ioc/server"
)

const (
	TEST_SUBJECT = "event_bus"
)

func main() {
	ioc.DevelopmentSetup()

	// 消息生产者
	bus.GetService().TopicSubscribe(context.Background(), TEST_SUBJECT, func(e *bus.Event) {
		fmt.Println(string(e.Data))
	})

	// 发布消息
	go func() {
		for {
			time.Sleep(1 * time.Second)
			err := bus.GetService().Publish(context.Background(), &bus.Event{
				Subject: TEST_SUBJECT,
				Data:    []byte("test"),
			})
			if err != nil {
				fmt.Println(err)
			}
		}
	}()

	// 消息消费者
	// 启动应用
	err := server.Run(context.Background())
	if err != nil {
		panic(err)
	}
}
```

### 基于RabbitMQ

基于rabbitmq的消息总线, 导入rabbitmq驱动即可, rabbitmq具体配置 见rabbitmq组件
```go
import (
    // rabbitmq总线
	_ "github.com/infraboard/mcube/v2/ioc/config/bus/rabbitmq"
)
```

具体样例
```go
package main

import (
	"context"
	"fmt"
	"time"

	"github.com/infraboard/mcube/v2/ioc/config/bus"
	// rabbitmq总线
	_ "github.com/infraboard/mcube/v2/ioc/config/bus/rabbitmq"

	"github.com/infraboard/mcube/v2/ioc"
	"github.com/infraboard/mcube/v2/ioc/server"
)

const (
	TEST_SUBJECT = "event_bus"
)

func main() {
	ioc.DevelopmentSetup()

	// 消息生产者
	bus.GetService().TopicSubscribe(context.Background(), TEST_SUBJECT, func(e *bus.Event) {
		fmt.Println(string(e.Data))
	})

	// 发布消息
	go func() {
		for {
			time.Sleep(1 * time.Second)
			err := bus.GetService().Publish(context.Background(), &bus.Event{
				Subject: TEST_SUBJECT,
				Data:    []byte("test"),
			})
			if err != nil {
				fmt.Println(err)
			}
		}
	}()

	// 消息消费者
	// 启动应用
	err := server.Run(context.Background())
	if err != nil {
		panic(err)
	}
}
```