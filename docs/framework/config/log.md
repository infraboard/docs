---
title: Log
sidebar_label: Log
---

常见的功能比较完善的日子库有:
+ logrus
+ zerolog
+ zap

其中以zerolog在性能和使用体验上较佳，因此选择集成zerolog

##  默认配置

```toml tab
[log]
  # 0 为打印日志全路径, 默认打印2层路径
  caller_deep = 3
  # 日志的级别, 默认Debug
  level = "debug"
  # 开启Trace时, 记录的TraceId名称, 默认trace_id
  trace_filed = "trace_id"

[log.console]
  enable = true
  no_color = false

[log.file]
  # 是否开启文件记录
  enable = false
  # 文件的路径
  file_path = ""
  # 单位M, 默认100M
  max_size = 100
  # 默认保存 6个文件
  max_backups = 6
  # 保存多久
  max_age = 0
  # 是否压缩
  compress = false
```

```env tab
LOG_CALLER_DEEP=3
LOG_LEVEL="debug"
LOG_TRACE_FILED="trace_id"

LOG_CONSOLE_ENABLE=true
LOG_CONSOLE_NO_COLOR=false

LOG_FILE_ENABLE=false
LOG_FILE_PATH=""
LOG_FILE_MAX_SIZE=100
LOG_FILE_MAX_BACKUPS=6
LOG_FILE_MAX_AGE=0
LOG_FILE_COMPRESS=false
```

更详细的信息请查看[源码](https://github.com/infraboard/mcube/blob/master/ioc/config/logger/log.go#L89-L99)


## 基本使用


### Global Logger

```go
package main

import (
	"github.com/infraboard/mcube/v2/ioc"
	"github.com/infraboard/mcube/v2/ioc/config/logger"
)

func main() {
	ioc.DevelopmentSetup()

	gLogger := log.L()
	glog.Debug().Msg("this is global logger debug msg")
}
```

```
2023-12-24T17:44:30+08:00 DEBUG  examples/log/main.go:12 > this is global logger debug msg
```

### Sub Logger

```go
package main

import (
	"github.com/infraboard/mcube/v2/ioc"
	"github.com/infraboard/mcube/v2/ioc/config/logger"
)

func main() {
	ioc.DevelopmentSetup()

	subLogger := log.Sub("app1")
	sublog.Debug().Msg("this is app1 sub logger debug msg")
}
```

```
2023-12-24T17:44:30+08:00 DEBUG  examples/log/main.go:15 > this is app1 sub logger debug msg component:APP1
```

### Trace Logger

```go
package main

import (
	"context"

	"github.com/infraboard/mcube/v2/ioc"
	"github.com/infraboard/mcube/v2/ioc/config/logger"
)

func main() {
	ioc.DevelopmentSetup()

	gLogger := log.L()
	glog.Debug().Msg("this is global logger debug msg")

	subLogger := log.Sub("app1")
	sublog.Debug().Msg("this is app1 sub logger debug msg")

	ctx := context.Background()
	traceLogger := log.T("app1").Trace(ctx)
	tracelog.Debug().Msg("this is app1 trace logger debug msg")
}
```

```
2023-12-24T17:47:02+08:00 DEBUG  examples/log/main.go:21 > this is app1 trace logger debug msg component:APP1 trace_id:00000000000000000000000000000000
```