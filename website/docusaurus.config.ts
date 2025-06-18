import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';

const config: Config = {
  title: '🍑 Pepino',
  tagline: '現在地周辺のオフラインイベントを「今すぐ」発見・参加',
  favicon: 'img/favicon.ico',

  // GitHub Pages設定
  url: 'https://kpab.github.io',
  baseUrl: '/pepino/',
  organizationName: 'kpab',
  projectName: 'pepino',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  // 日本語対応
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // ドキュメントをルートに
          editUrl: 'https://github.com/kpab/pepino/tree/main/website/',
        },
        blog: false, // ブログ機能無効
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: '🍑 Pepino',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'ドキュメント',
        },
        {
          href: 'https://github.com/kpab/pepino',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Pepino Project.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
