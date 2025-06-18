# 🦖 Docusaurus ドキュメントサイト構築

## 🎯 概要

現在のGitHub Pages（マークダウン直表示）から、より見やすく検索可能なDocusaurusサイトに移行します。

## 🏗️ 構成設計

### Role分離方式
```
pepino/
├── docs/                          # 📝 開発者向け詳細ドキュメント
│   └── (現在のマークダウンファイル群)
├── website/                       # 🌐 Docusaurus公開サイト
│   ├── docusaurus.config.js
│   ├── docs/                     # 公開用ドキュメント
│   ├── src/pages/                # カスタムページ
│   └── package.json
└── .github/workflows/
    └── deploy-docusaurus.yml      # 新しいデプロイワークフロー
```

### 役割分担
- **`docs/`**: 開発者向け詳細ドキュメント（維持）
- **`website/`**: ユーザー向け見やすいサイト（新規）
- **GitHub Pages**: Docusaurusサイト表示

## 🚀 セットアップ手順

### Step 1: Docusaurusインストール

```bash
cd /projects/pepino

# websiteフォルダでDocusaurusセットアップ
npx create-docusaurus@latest website classic --typescript

# Docusaurus依存関係インストール
cd website
npm install
```

### Step 2: 設定ファイル修正

**`website/docusaurus.config.ts`**
```typescript
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';

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
```

### Step 3: ドキュメント構造設計

**`website/sidebars.ts`**
```typescript
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '📋 要件・設計',
      items: [
        'requirements/overview',
        'requirements/user-personas',
        'requirements/features',
        'requirements/non-functional',
      ],
    },
    {
      type: 'category',
      label: '🎨 システム設計',
      items: [
        'design/architecture',
        'design/database',
        'design/api-spec',
        'design/security',
      ],
    },
    {
      type: 'category',
      label: '🛠️ 開発ガイド',
      items: [
        'development/setup',
        'development/coding-standards',
        'development/database-implementation',
        'development/testing',
        'development/deployment',
      ],
    },
    {
      type: 'category',
      label: '📊 プロジェクト管理',
      items: [
        'project-management/roadmap',
        'project-management/timeline',
        'project-management/decisions',
      ],
    },
  ],
};

export default sidebars;
```

### Step 4: GitHub Actions設定

**`.github/workflows/deploy-docusaurus.yml`**
```yaml
name: Deploy Docusaurus to GitHub Pages

on:
  push:
    branches: [ main ]
    paths: [ 'website/**' ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
          cache-dependency-path: website/package-lock.json
          
      - name: Install dependencies
        working-directory: ./website
        run: npm ci
        
      - name: Build
        working-directory: ./website
        run: npm run build
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./website/build

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 5: ドキュメント移行スクリプト

**`website/migrate-docs.js`** (自動移行用)
```javascript
const fs = require('fs-extra');
const path = require('path');

const sourceDir = '../docs';
const targetDir = './docs';

// マークダウンファイル移行 + frontmatter追加
async function migrateDocs() {
  await fs.ensureDir(targetDir);
  
  // 各カテゴリーのマッピング
  const categoryMap = {
    '01-requirements': 'requirements',
    '02-design': 'design', 
    '03-development': 'development',
    '04-project-management': 'project-management'
  };
  
  for (const [source, target] of Object.entries(categoryMap)) {
    const sourceCategory = path.join(sourceDir, source);
    const targetCategory = path.join(targetDir, target);
    
    if (await fs.pathExists(sourceCategory)) {
      await fs.copy(sourceCategory, targetCategory, {
        filter: (src) => path.extname(src) === '.md'
      });
    }
  }
}

migrateDocs().catch(console.error);
```

## 🎨 カスタマイズポイント

### テーマ設定
- **カラーテーマ**: Pepinoブランドカラー適用
- **ロゴ**: 🍑 ファビコン・ナビゲーションロゴ
- **フォント**: 日本語対応フォント設定

### 機能追加
- **検索機能**: Algolia DocSearch
- **多言語対応**: 日本語・英語
- **バージョニング**: リリース別ドキュメント

## 📊 移行メリット

### ユーザビリティ
- ✅ **検索機能**: 全文検索可能
- ✅ **ナビゲーション**: サイドバー・パンくずリスト
- ✅ **レスポンシブ**: モバイル対応
- ✅ **ダークモード**: 目に優しい表示

### 開発効率
- ✅ **マークダウン**: 既存ファイル活用
- ✅ **自動生成**: サイドバー・目次
- ✅ **プラグイン**: 図表・数式対応
- ✅ **編集リンク**: GitHub直接編集

### SEO・共有
- ✅ **メタタグ**: SEO対応
- ✅ **OGP**: SNS共有対応
- ✅ **サイトマップ**: 自動生成

## 🔄 移行スケジュール

### Week 1
- [x] セットアップ手順作成
- [ ] Docusaurusインストール
- [ ] 基本設定・テーマ適用

### Week 2  
- [ ] ドキュメント移行・構造調整
- [ ] GitHub Actions設定
- [ ] テストデプロイ

### Week 3
- [ ] カスタマイズ・最適化
- [ ] 検索機能追加
- [ ] 最終調整・本番デプロイ

## ⚠️ 注意点

### 既存環境への影響
- **`docs/` フォルダ**: 開発用として維持
- **既存ワークフロー**: 並行運用期間設定
- **URL変更**: リダイレクト設定考慮

### 運用ルール
- **更新フロー**: docs → website への同期方法
- **編集権限**: 開発者・コントリビューター
- **レビュープロセス**: プルリクエスト必須

---

## 🎯 次のアクション

1. **実装開始**: Step 1から順次実行
2. **テスト環境**: `website/` フォルダでローカル確認
3. **段階デプロイ**: テスト → プレビュー → 本番

このセットアップで、**見やすく検索可能で管理しやすい**ドキュメントサイトが構築できます！