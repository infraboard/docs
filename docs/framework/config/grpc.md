---
title: GRPC Server
sidebar_label: GRPC Server
---


## 默认配置

```toml tab
[grpc]
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
GRPC_ENABLE=false
GRPC_HOST="127.0.0.1"
GRPC_PORT=18010
GRPC_ENABLE_RECOVERY=true
GRPC_ENABLE_TRACE=true
```