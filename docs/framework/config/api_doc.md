---
title: API Doc
sidebar_label: API Doc
---

通过Swagger API Doc, 目前只支持:
+ gorestful框架


##  默认配置

```toml tab
# Swagger API文档路径配置
[apidoc]
  # Swagger API Doc URL路径
  path = "/apidocs.json"
```

```env tab
HTTP_API_DOC_PATH="/apidocs.json"
```


## 基本使用


### GoRestful框架

```go
import (
  // 开启API Doc
	_ "github.com/infraboard/mcube/v2/ioc/apps/apidoc/restful"
)
```


```sh
2024-01-01T15:22:24+08:00 INFO   apidoc/restful/swagger.go:55 > Get the Health using http://127.0.0.1:8080/apidocs.json component:API_DOC
```