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
    'framework',
    'framework/quickstart',
    {
      type: 'category',
      label: '业务接口',
      collapsed: false,
      items: [
        'framework/api/index',
        'framework/api/http',
        'framework/api/grpc',
      ],
    },
    {
      type: 'category',
      label: '业务组件',
      collapsed: false,
      items: [
        'framework/component/index',
        'framework/component/mysql',
        'framework/component/mongo',
        'framework/component/redis',
        'framework/component/log',
        'framework/component/kafka',
        'framework/component/cache',
        'framework/component/lock',
        'framework/component/trace',
      ],
    },
  ],
  tutorialSidebar: [
    'intro',
  ],
};

export default sidebars;
