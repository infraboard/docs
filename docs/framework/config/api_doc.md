---
title: API Doc
sidebar_label: API Doc
---

##  默认配置

```toml tab
# Swagger API文档路径配置
[apidoc]
  # Swagger API Doc URL路径, 默认自动生成带前缀的地址比如: /default/api/v1/apidoc 
  # 你也可以在这里直接配置绝对路径 比如: /apidocs.json
  path = ""
```

```env tab
HTTP_API_DOC_PATH=""
```


## 基本使用

### Gin框架

gin 框架是通过注释+代码生成的方式来实现的api文档自动生成

依赖的工具: 
+ [Swag](https://github.com/swaggo/swag/blob/master/README_zh-CN.md): 将Go的注释转换为Swagger2.0文档

#### 添加文档

1. 在main.go源代码中添加通用的API注释
```go
// @title           Swagger Example API
// @version         1.0
// @description     This is a sample server celler server.
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.basic  BasicAuth

// @externalDocs.description  OpenAPI
// @externalDocs.url          https://swagger.io/resources/open-api/
func main() {
	// 注册HTTP接口类
	ioc.Api().Registry(&HelloServiceApiHandler{})

	// 启动应用
	err := server.Run(context.Background())
	if err != nil {
		panic(err)
	}
}
```

2. 在controller代码中添加API操作注释
```go
// @Summary 修改文章标签
// @Description  修改文章标签
// @Tags         文章管理
// @Produce  json
// @Param id path int true "ID"
// @Param name query string true "ID"
// @Param state query int false "State"
// @Param modified_by query string true "ModifiedBy"
// @Success 200 {string} json "{"code":200,"data":{},"msg":"ok"}"
// @Router /api/v1/tags/{id} [put]
func (h *HelloServiceApiHandler) Hello(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": "hello mcube",
	})
}
```

#### 生成代码

1. 安装代码生成工具:
```sh
go install github.com/swaggo/swag/cmd/swag@latest
```

2. 在包含main.go文件的项目根目录运行swag init。这将会解析注释并生成需要的文件（docs文件夹和docs/docs.go）
```sh
swag init
```

3. 最后在main.go所在目录 就看到生成好的代码了
```sh
$ tree .  
.
|____docs
| |____swagger.yaml
| |____docs.go
| |____swagger.json
|____main.go
```

#### 引入工具

```go
import (
  ...
  // 引入生成好的API Doc代码
	_ "github.com/infraboard/mcube/v2/examples/http_gin/docs"
	// 引入集成工程
	_ "github.com/infraboard/mcube/v2/ioc/apps/apidoc/swaggo"
  ...
)
```

然后启动服务
```sh
studio :: mcube/examples/http_gin ‹master*› » go run main.go 
...
2024-01-04T14:24:00+08:00 INFO   apidoc/swaggo/swagger.go:52 > Get the API Doc using http://127.0.0.1:8080/default/api/v1/apidoc component:API_DOC
2024-01-04T14:24:00+08:00 INFO   config/http/http.go:211 > HTTP服务启动成功, 监听地址: 127.0.0.1:8080 component:HTTP
```

然后通过 http://127.0.0.1:8080/default/api/v1/apidoc 就可以访问到 swagger 生成的json api数据


### GoRestful框架

go-restful框架 是通过路由装饰来实现api文档的自动生成, 因此集成起来比较容易

#### 添加文档

```go
ws.Route(ws.GET("/{id}").To(h.DescribeBuildConfig).
  Doc("构建配置详情").
  Param(ws.PathParameter("id", "identifier of the secret").DataType("string")).
  Metadata(restfulspec.KeyOpenAPITags, tags).
  Writes(build.BuildConfig{}).
  Returns(200, "OK", build.BuildConfig{}).
  Returns(404, "Not Found", nil))
```

#### 引入工具

```go
import (
  // 开启API Doc
	_ "github.com/infraboard/mcube/v2/ioc/apps/apidoc/restful"
)
```

```sh
2024-01-01T15:22:24+08:00 INFO   apidoc/restful/swagger.go:55 > Get the API Doc using http://127.0.0.1:8080/apidocs.json component:API_DOC
```

## API Doc展示

要展示 Swagger 的 API Doc需要:
+ Swagger Doc API: 提供数据
+ Swagger UI: 提供数据展示

### Swagger Doc API

http://127.0.0.1:8080/apidocs.json
```json
{
	"swagger": "2.0",
	"paths": {
		"/metrics/v1/hello_module": {
			"get": {
				"consumes": [
					"application/json",
					"application/x-www-form-urlencoded",
					"multipart/form-data",
					"application/yaml",
					"application/yaml-k8s"
				],
				"produces": [
					"application/json",
					"application/yaml",
					"application/yaml-k8s"
				],
				"operationId": "func1",
				"responses": {
					"200": {
						"description": "OK"
					}
				}
			}
		}
	}
}
```

### Swagger UI


#### 在线展示

我们利用Swagger官网工具: [Swagger UI Live Demo](https://petstore.swagger.io/?_gl=1*tg05bx*_gcl_au*MTQzNjI0NTc1OC4xNzA0MTYwNDk2&_ga=2.121705474.883653745.1704160496-643310157.1681607298)


由于我们使用的在线工具, 会存在跨越问题(CORS), 因此需要引入跨越, 默认是全开放, 具体配置参数见CORS模块
```go
import (
	// 开启CORS, 允许资源跨域共享
	_ "github.com/infraboard/mcube/v2/ioc/config/cors"
)
```

![](/img/mcube/swagger_live_demo.png)