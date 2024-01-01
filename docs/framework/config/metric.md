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