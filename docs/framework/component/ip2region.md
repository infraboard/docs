---
title: IP位置解析
sidebar_label: IP位置解析
---

很多时候 我们需要IP地理位置解析, 比如异地登录检查:
```sh
1.2.3.4 --> 美国 华盛顿
```

这里我们集成[ip2region](https://github.com/lionsoul2014/ip2region/tree/master)这个项目, 在他仓库里面提供 关于Ip数据库文件: data/ip2region.xdb, 这里需要你们自己下载

## 配置组件

```toml tab
[ip2region]
  # 功能开关, 开启后 需要读取DB文件, 在执行单元测试时很不方便
  enable = true
  # DB 文件路径
  db_path = "etc/ip2region.xdb"
```

```env tab
IP2REGION_ENABLE=true
IP2REGION_DB_PATH="etc/ip2region.xdb"
```

## 基本使用

```go
package main

import (
	"fmt"

	"github.com/infraboard/mcube/v2/ioc"
	"github.com/infraboard/mcube/v2/ioc/config/ip2region"
)

func main() {
	ioc.DevelopmentSetup()

	resp, err := ip2region.Get().LookupIP("117.136.38.42")
	if err != nil {
		panic(err)
	}
	fmt.Println(resp)
	// 中国|0|北京|北京市|移动
}
```