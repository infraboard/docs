---
title: MySQL 数据库操作
sidebar_label: MySQL 数据库操作
---


操作关系型数据库我们并没有直接使用原生的sql.DB对象，而是选择比较流行的gorm

## 配置组件

```toml tab
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

```env tab
DATASOURCE_PROVIDER="mysql"
DATASOURCE_HOST="127.0.0.1"
DATASOURCE_PORT=3306
DATASOURCE_DB=""
DATASOURCE_USERNAME=""
DATASOURCE_PASSWORD=""
DATASOURCE_DEBUG=false
DATASOURCE_ENABLE_TRACE=true
```

## 环境准备

```
docker run --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:8.0 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

## 基本使用

使用datasource.DB() 获取数据库Grom DB对象:
```go
package main

import (
	"fmt"

	"github.com/infraboard/mcube/v2/ioc/config/datasource"
)

func main() {
	db := datasource.DB()
	// 通过db对象进行数据库操作
	fmt.Println(db)
}
```

[源码详细信息](https://github.com/infraboard/mcube/blob/master/ioc/config/datasource/grom.go#L28-L35)

## 事务传递

测试之前先准备好表: test_transactions
```sql
CREATE TABLE `test_transactions` (
    `id` varchar(64) NOT NULL COMMENT 'Primary Key',
    `filed_a` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci
```

使用DBFromCtx, 如果有事务这获取事务, 如果没有则获取普通DB对象:
```go
type TestStruct struct {
	Id     string `gorm:"column:id" json:"id"`
	FiledA string `gorm:"column:filed_a" json:"filed_a"`
}

func (s *TestStruct) TableName() string {
	return "test_transactions"
}

func TestTransaction(t *testing.T) {
	m := datasource.DB()
	t.Log(m)

	// 处理事务
	err := m.Transaction(func(tx *gorm.DB) error {
		// 处理自己逻辑
		tx.Save(&TestStruct{Id: "1", FiledA: "test"})

		// 处理其他业务逻辑
		txCtx := datasource.WithTransactionCtx(ctx, tx)
		if err := Tx1(txCtx); err != nil {
			return err
		}
		if err := Tx2(txCtx); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		panic(err)
	}
}

// 如果是事务则当前操作在事务中, 如果不是就是一个普通操作,回及时生效
func Tx1(ctx context.Context) error {
	db := datasource.DBFromCtx(ctx)
	db.Save(&TestStruct{Id: "2", FiledA: "test"})
	return nil
}

func Tx2(ctx context.Context) error {
	db := datasource.DBFromCtx(ctx)
	db.Save(&TestStruct{Id: "3", FiledA: "test"})
	return nil
}
```

## CURD样例

