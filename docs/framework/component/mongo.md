---
title: MongoDB 数据库操作
sidebar_label: MongoDB 数据库操作
---


monogodb 有Go语言官方SDK, 因此直接使用官方SDK Mongo Driver来操作MongoDB

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