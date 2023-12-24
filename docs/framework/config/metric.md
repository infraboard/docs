---
title: Metric
sidebar_label: Metric
---

metric 使用比较流行的 prometheus SDK接入

##  默认配置

```toml tab
[app.metric]
  enable = false
  provider = "prometheus"
  endpoint = "/metrics"
```

```env tab
ENABLE=false
METRIC_PROVIDER="prometheus"
ENDPOINT="/metrics"
```


## 自定义指标