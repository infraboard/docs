---
title: MySQL 数据库操作
sidebar_label: MySQL 数据库操作
---


操作关系型数据库我们并没有直接使用原生的sql.DB对象，而是选择比较流行的gorm

## 基本使用

```go
import (
	"context"
	"os"
	"testing"

	"github.com/infraboard/mcube/v2/ioc"
	"github.com/infraboard/mcube/v2/ioc/config/datasource"
)

func main() {
    db := datasource.DB(nil)
    // 通过db对象进行数据库操作
    db.Find()
}
```

## 配置组件

```toml
[datasource]
  provider = "mysql"
  host = "127.0.0.1"
  port = 3306
  database = ""
  username = ""
  password = ""
  debug = false
  enable_trace = true
```

[源码详细信息](https://github.com/infraboard/mcube/blob/master/ioc/config/datasource/grom.go#L28-L35)


## 事务传递


