---
title: 业务异常
sidebar_label: 业务异常
---

我们在进行接口调用时，有时候也需要根据接口的报错信息来 决定怎么处理后续逻辑, 比如:
+ Token过期, 前端需要让用户 跳转到重新登录的页面
+ 异地登录时, 前端需要提醒用户注意密码安全
+ 用户余额不足时, 前端需要让用户 跳转到重新充值的页面

凡是涉及到这些场景 我们都需要为我们的程序设计业务异常


## 现状

使用 fmt.Errorf或者errors.New()来生成异常
```go
// 声明异常
var (
    ERR_TOKEN_EXPIRED = errors.New("用户Token已经过期")
)
```


只有一个message: 用户Token已经过期, 不包含业务码, 也无法扩展

## 全局异常

mcube 已经将一些常用的异常预先定义了
```go
	reasonMap = map[int]string{
		CODE_UNAUTHORIZED:          "认证失败",
		CODE_NOT_FOUND:             "资源未找到",
		CODE_CONFLICT:              "资源已经存在",
		CODE_BAD_REQUEST:           "请求不合法",
		CODE_INTERNAL_SERVER_ERROR: "系统内部错误",
		CODE_FORBIDDEN:             "访问未授权",
		CODE_UNKNOWN:               "未知异常",
		CODE_ACCESS_TOKEN_ILLEGAL:  "访问令牌不合法",
		CODE_REFRESH_TOKEN_ILLEGAL: "刷新令牌不合法",
		CODE_OTHER_PLACE_LGOIN:     "异地登录",
		CODE_OTHER_IP_LOGIN:        "异常IP登录",
		CODE_OTHER_CLIENT_LOGIN:    "用户已经通过其他端登录",
		CODE_SESSION_TERMINATED:    "会话结束",
		CODE_ACESS_TOKEN_EXPIRED:   "访问过期, 请刷新",
		CODE_REFRESH_TOKEN_EXPIRED: "刷新过期, 请登录",
		CODE_VERIFY_CODE_REQUIRED:  "异常操作, 需要验证码进行二次确认",
		CODE_PASSWORD_EXPIRED:      "密码过期, 请找回密码或者联系管理员重置",
	}
```
 
+ 创建异常: exception.NewNotFound, NewXXX来创建这些预制的全局异常
+ 判断异常: exception.IsApiException
```go
import (
	"errors"
	"testing"

	"github.com/infraboard/mcube/v2/exception"
)

func TestNewNotFound(t *testing.T) {
	e := exception.NewNotFound("user %s not found", "alice")
	// {"service":"","http_code":404,"code":404,"reason":"资源未找到","message":"user alice not found","meta":null,"data":null}
	t.Log(e.ToJson())
	t.Log(exception.IsApiException(e, exception.CODE_NOT_FOUND))
}
```

## 自定义异常

很多时候 mcube内置的全局异常是不够用的, 当你需要定义与自己业务有关的异常时可以通过 NewApiException 来创建一个属于自己业务的异常

```go
import "github.com/infraboard/mcube/v2/exception"

const (
	CODE_INSUFFICIENT_BALANCE = 100001
)

func NewErrInsufficientBalance() *exception.ApiException {
	return exception.NewApiException(CODE_INSUFFICIENT_BALANCE, "余额不足")
}

func IsErrInsufficientBalance(err error) bool {
	return exception.IsApiException(err, CODE_INSUFFICIENT_BALANCE)
}
```



