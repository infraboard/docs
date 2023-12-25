---
title: HTTP Server
sidebar_label: HTTP Server
---

## 默认配置

```toml tab
[http]
  # 是否开启HTTP Server, 默认会根据是否有注册得有API对象来自动开启
  enable = false
  # HTTP服务Host
  host = "127.0.0.1"
  # HTTP服务端口
  port = 8010
  # API接口前缀
  path_prefix = "api"
  # 使用的http框架, 默认会根据当前注册的API对象,自动选择合适的框架
  web_framework = ""

  # HTTP服务器参数
  # HTTP Header读取超时时间
  read_header_timeout = 30
  # 读取HTTP整个请求时的参数
  read_timeout = 60
  # 响应超时时间
  write_timeout = 60
  # 启用了KeepAlive时 复用TCP链接的超时时间
  idle_timeout = 300
  # header最大大小
  max_header_size = "16kb"
  # 开启Trace
  enable_trace = false

# HTTP健康检查
[http.health_check]
  enabled = true

# 跨域配置
[http.cors]
  enabled = false
  cors_allowed_headers = ["*"]
  cors_allowed_domains = ["*"]
  cors_allowed_methods = ["HEAD", "OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"]

# Swagger API文档路径配置
[http.api_doc]
  # 是否开启API Doc
  enabled = true
  # Swagger API Doc URL路径
  doc_path = "/apidocs.json"
```

```env tab
HTTP_ENABLE=false
HTTP_HOST="127.0.0.1"
HTTP_PORT=8010
HTTP_PATH_PREFIX="api"
HTTP_WEB_FRAMEWORK= “”

HTTP_READ_HEADER_TIMEOUT=30
HTTP_READ_TIMEOUT=60
HTTP_WRITE_TIMEOUT=60
HTTP_IDLE_TIMEOUT=300
HTTP_MAX_HEADER_SIZE="16kb"

HTTP_ENABLE_TRACE=false
HTTP_HEALTH_CHECK_ENABLED=true

HTTP_CORS_ENABLED=false
HTTP_ALLOWED_HEADERS="*"
HTTP_ALLOWED_DOMAINS="*"
HTTP_ALLOWED_METHODS=""HEAD,OPTIONS,GET,POST,PUT,PATCH,DELETE"

HTTP_API_DOC_HTTP_API_DOC_ENABLED="true"
HTTP_API_DOC_HTTP_API_DOC_PATH="/apidocs.json"
```