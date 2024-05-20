import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  framework: [
    'framework/core/arch',
    'framework',
    'framework/quickstart',
    {
      type: 'category',
      label: '应用接口',
      collapsed: false,
      items: [
        'framework/api/index',
        'framework/api/http',
        'framework/api/grpc',
      ],
    },
    {
      type: 'category',
      label: '应用配置',
      collapsed: false,
      items: [
        'framework/config/server',
        'framework/config/api_doc',
        'framework/config/health_check',
        'framework/config/log',
        'framework/config/metric',
        'framework/config/trace',
        'framework/config/cors',
      ],
    },
    {
      type: 'category',
      label: '应用组件',
      collapsed: false,
      items: [
        'framework/component/mysql',
        'framework/component/mongo',
        'framework/component/redis',
        'framework/component/kafka',
        'framework/component/cache',
        'framework/component/lock',
        'framework/component/ip2region',
      ],
    },
    {
      type: 'category',
      label: '框架原理',
      collapsed: false,
      items: [
        'framework/core/ioc',
        'framework/core/di',
      ],
    },
  ],
  tutorialSidebar: [
    'intro',
  ],
};

export default sidebars;
