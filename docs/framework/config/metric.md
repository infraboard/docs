---
title: Metric
sidebar_label: Metric
---

metric 使用比较流行的 prometheus SDK接入

##  默认配置

```toml tab
[metric]
  enable = true
  provider = "prometheus"
  endpoint = "/metrics"
```

```env tab
METRIC_ENABLE=true
METRIC_PROVIDER="prometheus"
METRIC_ENDPOINT="/metrics"
```

## 基本使用

http://127.0.0.1:8080/metrics
```json
# HELP go_gc_duration_seconds A summary of the pause duration of garbage collection cycles.
# TYPE go_gc_duration_seconds summary
go_gc_duration_seconds{quantile="0"} 3.4167e-05
go_gc_duration_seconds{quantile="0.25"} 3.4167e-05
go_gc_duration_seconds{quantile="0.5"} 3.4167e-05
go_gc_duration_seconds{quantile="0.75"} 3.4167e-05
go_gc_duration_seconds{quantile="1"} 3.4167e-05
go_gc_duration_seconds_sum 3.4167e-05
go_gc_duration_seconds_count 1
...
```

### Gin框架

```go
// 非业务模块
_ "github.com/infraboard/mcube/v2/ioc/apps/metric/gin"
```


```sh
$ mcube/examples/http_gin ‹master*› » go run main.go 
...
2023-12-27T11:21:07+08:00 INFO   metric/gin/metric.go:51 > Get the Metric using http://127.0.0.1:8080/metrics component:METRIC
...
```

### GoRestful框架

```go
// 非业务模块
_ "github.com/infraboard/mcube/v2/ioc/apps/metric/restful"
```


```sh
$ mcube/examples/http_go_restful ‹master*› » go run main.go 
...
2023-12-27T11:18:40+08:00 INFO   metric/restful/metric.go:55 > Get the Metric using http://127.0.0.1:8080/metrics component:METRIC
...
```

## 自定义指标

这里使用prometheus SDK提供的默认注册表, 因此只需要将编写好的自定义采集器 注册到 默认注册表即可

### 编写Collector

```go
package impl

import "github.com/prometheus/client_golang/prometheus"

func NewEventCollect() *EventCollect {
	return &EventCollect{
		errCountDesc: prometheus.NewDesc(
			"save_event_error_count",
			"事件入库失败个数统计",
			[]string{},
			prometheus.Labels{"service": "maudit"},
		),
	}
}

// 收集事件指标的采集器
type EventCollect struct {
	errCountDesc *prometheus.Desc
	// 需要自己根据实践情况来维护这个变量
	errCount int
}

func (c *EventCollect) Inc() {
	c.errCount++
}

// 指标元数据注册
func (c *EventCollect) Describe(ch chan<- *prometheus.Desc) {
	ch <- c.errCountDesc
}

// 指标的值的采集
func (c *EventCollect) Collect(ch chan<- prometheus.Metric) {
	ch <- prometheus.MustNewConstMetric(c.errCountDesc, prometheus.GaugeValue, float64(c.errCount))
}
```


### 注册采集器

在控制器初始化的时候完成注册:
```go
// 控制器初始化
func (i *HelloServiceImpl) Init() error {
	// 从Ioc总获取GORM DB对象, GORM相关配置已经托管给Ioc
	// Ioc会负责GORM的配置读取和为你初始化DB对象实例,以及关闭
	i.db = datasource.DB()

	// 将采集器注册到默认注册表
	i.colector = NewEventCollect()
	prometheus.MustRegister(i.colector)
	return nil
}
```


### 自定义指标处理

在业务控制器内，根据实际情况使用自定义指标纪录应用当前状态:
```go
// 具体业务逻辑
func (i *HelloServiceImpl) Hello() string {
	// 模拟存储失败报错, 然后调用采集器纪录状态
	err := errors.New("save event error")
	if err != nil {
		i.colector.Inc()
	}

	return "hello world"
}
```

### 自定义指标验证

最后访问: http://127.0.0.1:8020/metrics 
```
# HELP save_event_error_count 事件入库失败个数统计
# TYPE save_event_error_count gauge
save_event_error_count{service="maudit"} 0
```