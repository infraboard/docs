---
title: Cros
sidebar_label: Cros
---


##  默认配置

```toml tab
[cors]
  enabled = false
  cors_allowed_headers = ["*"]
  cors_allowed_origins = ["*"]
  cors_allowed_methods = ["HEAD", "OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"]
  cors_expose_headers = []
  cors_allow_cookies = false
  # 12小时
  max_age = 43200
```

```env tab
HTTP_CORS_ENABLED=false
HTTP_CORS_ALLOWED_HEADERS="*"
HTTP_CORS_ALLOWED_DOMAINS="*"
HTTP_CORS_ALLOWED_METHODS=""HEAD,OPTIONS,GET,POST,PUT,PATCH,DELETE"
HTTP_CORS_EXPOSE_HEADERS=""
HTTP_CORS_ALLOW_COOKIES=false
HTTP_CORS_MAX_AGE=43200
```


## 基本使用


### Gin框架使用


```go
import (
    ...
    _ "github.com/infraboard/mcube/v2/ioc/config/cors/gin"
    ...
)
```



### GoRestful框架使用

```go
import (
    ...
    _ "github.com/infraboard/mcube/v2/ioc/config/cors/gorestful"
    ...
)
```

