import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '🎨 システム設計',
      items: [
        'design/database',
      ],
    },
    {
      type: 'category',
      label: '🛠️ 開発ガイド',
      items: [
        'development/setup',
        'development/database-implementation',
      ],
    },
    {
      type: 'category',
      label: '📊 プロジェクト管理',
      items: [
        'project-management/decisions',
      ],
    },
  ],
};

export default sidebars;
