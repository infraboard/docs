---
title: Metric
sidebar_label: Metric
---

metric 使用比较流行的[prometheus SDK](https://prometheus.io/docs/instrumenting/clientlibs/)接入

##  默认配置

```toml tab
[metric]
  enable = true
  provider = "prometheus"
  endpoint = "/metrics"

[metric.api_stats]
  enable = true
  # 50线 90线 99线
  request_summary = true
  request_summary_name = "http_request_duration"
  request_summary_objective = [0.5, 0.9, 0.99]
  # 响应时长分布(单位毫秒)
  request_histogram = false
  request_histogram_name = "http_request_duration"
  request_histogram_bucket = [100, 250, 500, 1000, 2500, 5000, 10000]
  # 请求总数
  request_total = true
  request_total_name = "http_request_total"
```

```env tab
METRIC_ENABLE=true
METRIC_PROVIDER="prometheus"
METRIC_ENDPOINT="/metrics"

METRIC_API_STATS_ENABLE=true
METRIC_API_STATS_REQUEST_HISTOGRAM=true
METRIC_API_STATS_REQUEST_HISTOGRAM_NAME=http_request_duration
METRIC_API_STATS_REQUEST_HISTOGRAM_BUCKET=100,250,500,1000,2500,5000,10000
METRIC_API_STATS_REQUEST_SUMMARY=true
METRIC_API_STATS_REQUEST_SUMMARY_NAME="http_request_duration"
METRIC_API_STATS_REQUEST_SUMMARY_OBJECTIVE=0.5,0.9,0.99
METRIC_API_STATS_REQUEST_TOTAL=true
METRIC_API_STATS_REQUEST_TOTAL_NAME="http_request_total"
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


## API Stats

默认统计了 API响应时长的 50线 90线 99线

访问: http://127.0.0.1:8080/metrics/
```
# HELP http_request_duration Histogram of the duration of HTTP requests
# TYPE http_request_duration summary
http_request_duration{app="",method="GET",path="/metrics/",quantile="0.5"} 1.527666
http_request_duration{app="",method="GET",path="/metrics/",quantile="0.9"} 5.361042
http_request_duration{app="",method="GET",path="/metrics/",quantile="0.99"} 5.361042
http_request_duration_sum{app="",method="GET",path="/metrics/"} 7.5801240000000005
http_request_duration_count{app="",method="GET",path="/metrics/"} 3
# HELP http_request_total Total number of HTTP rquests
# TYPE http_request_total counter
http_request_total{app="",method="GET",path="/metrics/",status_code="200"} 3
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


### 注册Collector

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