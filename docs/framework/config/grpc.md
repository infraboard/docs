---
title: GRPC Server
sidebar_label: GRPC Server
---


## 默认配置

```toml tab
[app.grpc]
  # 开启GRPC服务
  enable = false
  # Server监听的地址
  host = "127.0.0.1"
  # Server监听的端口
  port = 18010
  # 开启recovery恢复
  enable_recovery = true
  # 开启Trace
  enable_trace = true
```

```env tab
ENABLE=false
HOST="127.0.0.1"
PORT=18010
ENABLE_RECOVERY=true
ENABLE_TRACE=true
```