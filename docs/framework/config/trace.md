---
title: Trace
sidebar_label: Trace
---


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

## 基本使用




## 自定义埋点

