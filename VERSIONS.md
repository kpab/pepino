# 🔧 Pepino - 技術スタック & バージョン管理

## 📦 Core Technologies

### Runtime & Framework

| Technology     | Version    | 理由・備考             |
| -------------- | ---------- | ---------------------- |
| **Node.js**    | `18.18.0+` | LTS 版、Vercel 推奨    |
| **Next.js**    | `14.0.0+`  | App Router、最新安定版 |
| **React**      | `18.2.0+`  | Next.js 14 対応版      |
| **TypeScript** | `5.2.0+`   | 最新安定版、型安全性   |

### Styling & UI

| Technology       | Version   | 理由・備考               |
| ---------------- | --------- | ------------------------ |
| **Tailwind CSS** | `3.3.5+`  | ユーティリティファースト |
| **Headless UI**  | `1.7.17+` | アクセシブルな UI 基盤   |
| **Heroicons**    | `2.0.18+` | Tailwind 公式アイコン    |
| **Lucide React** | `latest`  | 追加アイコンセット       |

### State & Forms

| Technology          | Version   | 理由・備考                   |
| ------------------- | --------- | ---------------------------- |
| **Zustand**         | `4.4.6+`  | 軽量状態管理                 |
| **React Hook Form** | `7.47.0+` | 高性能フォーム               |
| **Zod**             | `latest`  | TypeScript schema validation |

### Maps & Location

| Technology                    | Version   | 理由・備考                 |
| ----------------------------- | --------- | -------------------------- |
| **Google Maps JS API**        | `latest`  | 地図表示・ジオコーディング |
| **@googlemaps/js-api-loader** | `1.16.2+` | 公式ローダー               |

### Development Tools

| Technology      | Version   | 理由・備考                  |
| --------------- | --------- | --------------------------- |
| **ESLint**      | `8.51.0+` | Next.js 推奨設定            |
| **Prettier**    | `3.0.3+`  | コード整形                  |
| **Husky**       | `8.0.3+`  | Git hooks                   |
| **lint-staged** | `15.0.2+` | ステージ済みファイルの lint |

### Quality & Testing

| Technology          | Version  | 理由・備考         |
| ------------------- | -------- | ------------------ |
| **Jest**            | `latest` | ユニットテスト     |
| **Testing Library** | `latest` | React テスト       |
| **Playwright**      | `latest` | E2E テスト（将来） |

### Build & Deploy

| Technology         | Version  | 理由・備考     |
| ------------------ | -------- | -------------- |
| **Docker**         | `20.10+` | 開発環境統一   |
| **Docker Compose** | `2.0+`   | マルチコンテナ |
| **Vercel CLI**     | `latest` | デプロイ自動化 |

## 🎯 バージョン管理方針

### Semantic Versioning

プロジェクト自体のバージョニング：

- **Major (1.0.0)**: 破壊的変更・大型リリース
- **Minor (0.1.0)**: 機能追加・MVP 段階
- **Patch (0.0.1)**: バグフィックス・小改善

### 依存関係更新戦略

- **Major 更新**: 慎重検討、テスト必須
- **Minor 更新**: 月次で検討
- **Patch 更新**: Dependabot 自動 + 週次確認

### Lock File 管理

- **package-lock.json**: 厳密にコミット
- **Node.js 版**: `.nvmrc`で固定
- **チーム開発**: 同一環境保証

## 🔄 アップデート予定

### 近日中 (MVP 期間中)

- Next.js 14 安定版への追従
- React 18.3 検討
- Tailwind CSS 3.4 検討

### 中期的 (MVP 後)

- Database: PostgreSQL 15+ + PostGIS
- Authentication: NextAuth.js v5
- Monitoring: Sentry
- Analytics: Vercel Analytics

## 📝 Browser Support

### Target Browsers

| Browser     | Version | Market Share | 優先度 |
| ----------- | ------- | ------------ | ------ |
| **Chrome**  | 90+     | ~65%         | 最高   |
| **Safari**  | 14+     | ~20%         | 高     |
| **Firefox** | 88+     | ~8%          | 中     |
| **Edge**    | 90+     | ~5%          | 中     |

### Mobile Support

- **iOS Safari**: 14.5+
- **Chrome Mobile**: 90+
- **Samsung Internet**: 15+

### Progressive Enhancement

- 基本機能: 全ブラウザ対応
- 高度機能: モダンブラウザのみ
- 位置情報: Geolocation API 対応必須

## ⚠️ Breaking Changes Log

### v0.1.0 → v0.2.0 (予定)

- 外部 API 統合により型定義変更
- 地図コンポーネントの Props 変更

### Future Breaking Changes

- v1.0.0: ユーザー認証システム導入
- v2.0.0: モバイルアプリ化検討

## 🎯 Performance Targets

### Core Web Vitals

- **LCP**: < 2.5 秒
- **FID**: < 100ms
- **CLS**: < 0.1

### Bundle Size

- **Initial JS**: < 250KB
- **Total Size**: < 1MB
- **Image Optimization**: Next.js Image + WebP

---

**最終更新**: 2025 年 6 月 18 日 | **管理者**: kpab
