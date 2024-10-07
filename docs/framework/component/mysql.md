---
title: MySQL 数据库操作
sidebar_label: MySQL 数据库操作
---

操作关系型数据库我们并没有直接使用原生的sql.DB对象，而是会选择一款ORM框架。

## ORM框架

ORM框架(Object Relational Mapping) 是将数据库表与对象进行映射，从而可以通过对象操作数据库表。

Go中最流行的ORM库:
+ [gorm](https://github.com/go-gorm/gorm): 功能强大且易于使用，支持丰富的特性和多种数据库，适合快速开发。 
+ [sqlx](https://github.com/jmoiron/sqlx): 轻量级库，提供对原生 SQL 的支持，注重性能和灵活性，适合需要复杂查询的场景
+ [xorm](https://gitea.com/xorm/xorm): 简洁易用，支持多种数据库，适合小型项目和快速开发
+ [sqlboiler](https://github.com/volatiletech/sqlboiler): 基于模型生成代码，强调性能和类型安全，适合对性能有较高要求的应用

这里选择支持gorm:
	+ gorm: 当前流行度最高，文档最完善

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
  trace = true
```

```env tab
DATASOURCE_PROVIDER="mysql"
DATASOURCE_HOST="127.0.0.1"
DATASOURCE_PORT=3306
DATASOURCE_DB=""
DATASOURCE_USERNAME=""
DATASOURCE_PASSWORD=""
DATASOURCE_DEBUG=false
DATASOURCE_TRACE=true
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

### 环境准备

```sh
docker run --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:8.0 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```