import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';

const config: Config = {
  title: '🍑 Pepino',
  tagline: '現在地周辺のオフラインイベントを「今すぐ」発見・参加',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://kpab.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/pepino/',

  // GitHub pages deployment config.
  organizationName: 'kpab',
  projectName: 'pepino',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
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
      links: [
        {
          title: 'ドキュメント',
          items: [
            {
              label: 'はじめに',
              to: '/intro',
            },
          ],
        },
        {
          title: 'リンク',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/kpab/pepino',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Pepino Project.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
