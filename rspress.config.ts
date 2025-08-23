import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'mcube',
  description: '基于IOC为开发者提供配置即用的组件化开发体验的工具箱',
  icon: '/log.png',
  logo: {
    light: '/log.png',
    dark: '/log.png',
  },
  logoText: 'mcube',
  themeConfig: {
    outlineTitle: '目录',
    prevPageText: '上一页',
    nextPageText: '下一页',
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/infraboard/mcube',
      },
    ],
  },
});
