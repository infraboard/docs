---
title: Trace
sidebar_label: Trace
---

OpenTelemetry 也被称为 OTEL，是一个供应商中立的、开源的可观测性框架， 可用于插桩、生成、采集和导出链路、 指标和日志等遥测数据。
OpenTelemetry 作为一个行业标准，得到了 40 多个可观测供应商的支持， 被许多代码库、服务和应用集成，被众多最终用户采用。

因此我们Trace标准采用 [opentelemetry](https://opentelemetry.io/docs/)

##  默认配置

```toml tab
[trace]
  enable = false
  provider = "otlp"
  endpoint = "127.0.0.1:4318"
  insecure = true
```

```env tab
TRACE_ENABLE=false
TRACE_PROVIDER="otlp"
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="127.0.0.1:4318"
TRACE_INSECURE = true
```

## 样例演示

![iam](/img/trace/example.png)

### 环境准备

这里我们使用jaeger作为Trace Provider, 需要提前安装Jager
```sh
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```


### 接口

社区提供了很多开箱即用的组件库: [Registry](https://opentelemetry.io/ecosystem/registry/)


### 数据库


### 客户端


## 自定义埋点

```go
```