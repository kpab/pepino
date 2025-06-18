# 📚 Pepino - ドキュメント自動化ガイド

## 📋 概要
プロジェクトドキュメントの自動公開・更新システム構築

**優先度**: 低（Week 5-6 で実装予定）

---

## 🎯 ドキュメント自動化の目的

### メリット
- ✅ **自動公開**: マークダウン更新で即座にWebサイト反映
- ✅ **チーム共有**: 美しいドキュメントサイトでの情報共有
- ✅ **検索性**: 全文検索・ナビゲーション機能
- ✅ **版本管理**: Gitと連動した更新履歴

### 対象ドキュメント
- 📋 要件定義・設計書
- 🛠️ 開発ガイド・API仕様
- 📊 プロジェクト管理・進捗
- 📚 ユーザーマニュアル（将来）

---

## 🔧 ドキュメントツール比較

### 1. GitHub Pages (推奨)

**特徴**:
- 無料・簡単・GitHub統合
- Jekyll/Hugo対応
- カスタムドメイン可能

**適用場面**: 
- 簡単な静的サイト
- プロジェクト専用ドキュメント

### 2. VitePress

**特徴**:
- Vue.js製・高速
- モダンなUI・優れた検索
- Markdown拡張機能豊富

**適用場面**:
- 技術ドキュメント重視
- 高度なカスタマイズ

### 3. Docusaurus (Facebook製)

**特徴**:
- React製・多機能
- 版本管理・多言語対応
- ブログ機能内蔵

**適用場面**:
- 大規模プロジェクト
- 公開API・プロダクトドキュメント

---

## 🚀 推奨構成: GitHub Pages + VitePress

### ディレクトリ構成

```
pepino/
├── docs/                    # 既存ドキュメント
│   ├── 01-requirements/
│   ├── 02-design/
│   ├── 03-development/
│   └── 04-project-management/
├── docs-site/               # VitePress設定
│   ├── .vitepress/
│   │   ├── config.ts
│   │   └── theme/
│   ├── index.md            # トップページ
│   ├── guide/              # ガイド
│   └── api/                # API仕様
└── .github/workflows/
    └── docs-deploy.yml     # 自動デプロイ
```

---

## ⚙️ VitePress設定

### 1. VitePress初期化

```bash
# docs-site ディレクトリ作成
mkdir docs-site
cd docs-site

# VitePress インストール
npm init -y
npm install -D vitepress

# 初期設定
npx vitepress init
```

### 2. 設定ファイル

```typescript
// docs-site/.vitepress/config.ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Pepino Documentation',
  description: '現在地周辺のオフラインイベント発見アプリ',
  
  // GitHub Pages設定
  base: '/pepino/',
  
  themeConfig: {
    // ナビゲーション
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Project', link: '/project/' }
    ],
    
    // サイドバー
    sidebar: {
      '/guide/': [
        {
          text: '開発ガイド',
          items: [
            { text: '環境構築', link: '/guide/setup' },
            { text: 'データベース', link: '/guide/database' },
            { text: 'Docker', link: '/guide/docker' }
          ]
        }
      ],
      
      '/api/': [
        {
          text: 'API仕様',
          items: [
            { text: '概要', link: '/api/' },
            { text: 'イベント', link: '/api/events' },
            { text: '位置情報', link: '/api/location' }
          ]
        }
      ],
      
      '/project/': [
        {
          text: 'プロジェクト管理',
          items: [
            { text: 'ロードマップ', link: '/project/roadmap' },
            { text: 'ガントチャート', link: '/project/gantt' },
            { text: '進捗', link: '/project/progress' }
          ]
        }
      ]
    },
    
    // ソーシャルリンク
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kpab/pepino' }
    ],
    
    // フッター
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 kpab'
    },
    
    // 検索
    search: {
      provider: 'local'
    }
  },
  
  // Markdownカスタマイズ
  markdown: {
    // シンタックスハイライト
    theme: 'github-dark',
    
    // Mermaid図表サポート
    config: (md) => {
      // mermaid plugin configuration
    }
  }
})
```

### 3. 自動生成スクリプト

```javascript
// scripts/generate-docs.js
const fs = require('fs')
const path = require('path')

// docs/ から docs-site/ への変換
function generateDocsSite() {
  const sourceDir = './docs'
  const targetDir = './docs-site'
  
  // ディレクトリ構造をスキャン
  const structure = scanDirectory(sourceDir)
  
  // VitePress形式に変換
  structure.forEach(file => {
    convertMarkdownFile(file.source, file.target)
  })
  
  console.log('ドキュメントサイト生成完了')
}

function convertMarkdownFile(source, target) {
  const content = fs.readFileSync(source, 'utf8')
  
  // メタデータ追加
  const vitepressContent = `---
title: ${extractTitle(content)}
description: ${extractDescription(content)}
---

${content}`
  
  // 出力
  fs.writeFileSync(target, vitepressContent)
}

function extractTitle(content) {
  const match = content.match(/^# (.+)/m)
  return match ? match[1] : 'Untitled'
}

function extractDescription(content) {
  const match = content.match(/## 📋 概要\n(.+)/m)
  return match ? match[1] : ''
}

// 実行
generateDocsSite()
```

---

## 🔄 自動デプロイ設定

### GitHub Actions ワークフロー

```yaml
# .github/workflows/docs-deploy.yml
name: Deploy Documentation

on:
  push:
    branches: [ main ]
    paths: [ 'docs/**', 'docs-site/**' ]
  
  # 手動実行可能
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: |
          cd docs-site
          npm ci
          
      - name: Generate docs from markdown
        run: |
          node scripts/generate-docs.js
          
      - name: Build VitePress
        run: |
          cd docs-site
          npm run build
          
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: docs-site/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### パッケージ設定

```json
// docs-site/package.json
{
  "name": "pepino-docs",
  "version": "1.0.0",
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview",
    "generate": "node ../scripts/generate-docs.js"
  },
  "devDependencies": {
    "vitepress": "^1.0.0",
    "@mermaid-js/mermaid": "^10.2.0"
  }
}
```

---

## 📄 コンテンツ変換

### 1. トップページ

```markdown
<!-- docs-site/index.md -->
---
layout: home

hero:
  name: "Pepino"
  text: "オフラインイベント発見アプリ"
  tagline: 現在地周辺の「今すぐ」参加できるイベントを発見
  image:
    src: /logo.png
    alt: Pepino
  actions:
    - theme: brand
      text: 開発ガイド
      link: /guide/setup
    - theme: alt
      text: プロジェクト概要
      link: /project/roadmap

features:
  - icon: 📍
    title: 位置情報ベース
    details: GPS・手動設定による近場イベント検索
  - icon: ⚡
    title: 即時参加
    details: 今から2時間以内に参加可能なイベント
  - icon: 🎯
    title: オフライン限定
    details: リアルな出会いと体験に特化
---

## 📊 開発状況

現在MVP開発中（2025年8月リリース予定）

### ✅ 完了
- Next.js 14環境構築
- Supabase（PostgreSQL + PostGIS）選定
- 基本UI実装

### 🔄 進行中  
- イベント一覧・検索機能
- GitHub Projects管理体制
- Docker環境構築

### ⏳ 予定
- Google Maps統合
- 外部API連携
- PWA対応
```

### 2. API仕様自動生成

```typescript
// scripts/generate-api-docs.ts
import { OpenAPIGenerator } from './openapi-generator'

// Supabase スキーマから自動生成
const generator = new OpenAPIGenerator({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
})

generator.generateDocs('./docs-site/api/')
```

---

## 🎨 カスタムテーマ

### VitePress テーマカスタマイズ

```vue
<!-- docs-site/.vitepress/theme/Layout.vue -->
<template>
  <Layout>
    <template #nav-bar-title-after>
      <span class="beta-badge">MVP</span>
    </template>
    
    <template #aside-bottom>
      <div class="progress-widget">
        <h4>開発進捗</h4>
        <div class="progress-bar">
          <div class="progress-fill" :style="{width: '40%'}"></div>
        </div>
        <p>40% 完了</p>
      </div>
    </template>
  </Layout>
</template>

<style>
.beta-badge {
  background: #f59e0b;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 8px;
}

.progress-widget {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ef4444;
  transition: width 0.3s ease;
}
</style>
```

---

## 🔍 高度な機能

### 1. Mermaid図表サポート

```javascript
// docs-site/.vitepress/config.ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  markdown: {
    config: (md) => {
      md.use(require('markdown-it-mermaid'))
    }
  }
})
```

### 2. 自動更新通知

```yaml
# .github/workflows/docs-notify.yml
name: Docs Update Notification

on:
  push:
    paths: [ 'docs/**' ]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: "📚 ドキュメントが更新されました: https://kpab.github.io/pepino/"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 3. コメント機能（Giscus）

```vue
<!-- docs-site/.vitepress/components/Comments.vue -->
<template>
  <div class="giscus-container">
    <script 
      src="https://giscus.app/client.js"
      data-repo="kpab/pepino"
      data-repo-id="your-repo-id"
      data-category="Documentation"
      data-category-id="your-category-id"
      data-mapping="pathname"
      data-reactions-enabled="1"
      data-emit-metadata="0"
      data-input-position="bottom"
      data-theme="light"
      data-lang="ja"
      crossorigin="anonymous"
      async>
    </script>
  </div>
</template>
```

---

## 📊 代替案: Docusaurus

### Docusaurus設定例

```javascript
// docs-site/docusaurus.config.js
module.exports = {
  title: 'Pepino Documentation',
  tagline: '現在地周辺のオフラインイベント発見アプリ',
  url: 'https://kpab.github.io',
  baseUrl: '/pepino/',
  
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/kpab/pepino/tree/main/docs-site/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/kpab/pepino/tree/main/docs-site/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  
  themeConfig: {
    navbar: {
      title: 'Pepino',
      logo: {
        alt: 'Pepino Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/kpab/pepino',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
  },
}
```

---

## 🚀 実装スケジュール

### Week 5 (7/2-7/8): 基本設定

| 日付 | タスク | 工数 |
|------|--------|------|
| 7/2 | VitePress初期設定 | 2h |
| 7/3 | ドキュメント変換スクリプト | 2h |
| 7/4 | GitHub Actions設定 | 1h |

### Week 6 (7/9-7/15): 高度な機能

| タスク | 工数 |
|--------|------|
| カスタムテーマ作成 | 2h |
| API仕様自動生成 | 2h |
| 検索・コメント機能 | 1h |

---

## 📚 参考リンク

- [VitePress Documentation](https://vitepress.dev/)
- [Docusaurus Documentation](https://docusaurus.io/)
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [Mermaid Documentation](https://mermaid.js.org/)

---

## 🔄 更新履歴

| 日付 | 更新内容 | 担当 |
|------|----------|------|
| 2025/6/18 | ドキュメント自動化設計・VitePress構成作成 | Claude |

次回更新: ドキュメント自動化実装完了時（Week 5-6）
