---
title: Trace
sidebar_label: Trace
---




##  默认配置

```toml tab
[app.trace]
  enable = false
  provider = "jaeger"
  endpoint = "http://localhost:14268/api/traces"
```

```env tab
ENABLE=false
TRACE_PROVIDER="jaeger"
TRACE_PROVIDER_ENDPOINT="http://localhost:14268/api/traces"
```


## 自定义埋点

