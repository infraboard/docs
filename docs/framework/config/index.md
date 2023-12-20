---
title: 基础配置
sidebar_label: 基础配置
---


```go
import (
    ...
    "github.com/infraboard/mcube/v2/ioc/config/application"
    ...
)

// 启动应用
err = application.App().Start(context.Background())
if err != nil {
    panic(err)
}
```

这样启动的应用使用的是默认配置:
```toml
[app]
  name = "mcube_app"

[app.http]
  host = "127.0.0.1"
  port = 8010
  path_prefix = "api"d

[app.grpc]
  host = "127.0.0.1"
  port = 18010
```
完整的[默认配置](https://github.com/infraboard/mcube/blob/master/examples/etc/application.toml)， 更多信息请查看[应用配置源码](https://github.com/infraboard/mcube/blob/master/ioc/config/application/application.go#L33-L41)