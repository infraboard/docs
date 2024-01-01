---
title: Health Check
sidebar_label: Health Check
---


##  默认配置

```toml tab
[health]
  path = "/healthz"
```

```env tab
HTTP_HEALTH_CHECK_PATH="/healthz"
```


## 基本使用


http://127.0.0.1:8080/healthz

```json
{
    "code":0,
    "data":{
        "status":"SERVING"
    }
}
```

### Gin框架

```go
// 健康检查
_ "github.com/infraboard/mcube/v2/ioc/apps/health/gin"
```


```sh
$ mcube/examples/http_gin ‹master*› » go run main.go 
...
2024-01-01T15:31:27+08:00 INFO   health/gin/check.go:52 > Get the Health using http://127.0.0.1:8080/healthz component:HEALTH_CHECK
...
```

### GoRestful框架

```go
// 健康检查
_ "github.com/infraboard/mcube/v2/ioc/apps/health/restful"
```

```sh
$ mcube/examples/http_go_restful ‹master*› » go run main.go 
...
2023-12-27T11:18:40+08:00 INFO   metric/restful/metric.go:55 > Get the Metric using http://127.0.0.1:8080/metrics component:METRIC
...
```