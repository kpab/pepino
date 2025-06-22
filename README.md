# 🍑 Pepino

**現在地周辺のオフラインイベントを「今すぐ」発見・参加できるWebアプリ**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com/)
[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- ALL-CONTRIBUTORS-LIST:END -->


## 🎯 概要

Pepinoは、**リアルな出会いと体験**に特化したイベント発見アプリです。

### 🔑 核心価値
- **オフライン限定**: リアルな出会いに特化
- **位置情報ベース**: GPS中心の近場イベント表示  
- **即時性**: 「今から2時間後」のような柔軟な参加
- **統合表示**: connpass等外部APIとの連携

### 🎪 主要機能 (MVP)
- [x] **位置情報取得**: GPS自動取得 + 手動設定
- [ ] **近傍イベント表示**: 現在地から5km以内のイベント一覧
- [ ] **地図表示**: Google Maps上でのイベント位置確認
- [ ] **検索・フィルター**: カテゴリ・距離・時間での絞り込み
- [ ] **イベント詳細**: アクセス情報・参加者構成表示

## 🏗️ 技術構成

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.2+
- **Styling**: Tailwind CSS 3.4+
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod

### バックエンド・データベース
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Geospatial**: PostGIS for 地理的検索
- **Realtime**: Supabase Realtime
- **Authentication**: Supabase Auth (将来実装)

### インフラ
- **Hosting**: Vercel (予定)
- **Maps**: Google Maps JavaScript API
- **CI/CD**: GitHub Actions

## 🚀 クイックスタート

### 1. 環境構築

```bash
# リポジトリクローン
git clone https://github.com/kpab/pepino.git
cd pepino

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.local を編集（Supabase設定等）
```

### 2. データベースセットアップ

**Supabase**を使用します：

1. [supabase.com](https://supabase.com) でアカウント作成
2. 新規プロジェクト作成（リージョン: Northeast Asia）
3. PostGIS拡張有効化: `CREATE EXTENSION postgis;`
4. [詳細なセットアップ手順](docs/03-development/01-setup.md)

### 3. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアプリにアクセス

## 📚 ドキュメント

### 📋 プロジェクト管理
- [要件定義](docs/01-requirements/) - ユーザー像・機能要件
- [技術選定記録](docs/04-project-management/03-decisions.md) - 技術判断の経緯
- [開発ロードマップ](docs/04-project-management/01-roadmap.md) - 全体計画

### 🎨 設計
- [システム構成](docs/02-design/01-architecture.md) - 全体アーキテクチャ
- [データベース設計](docs/02-design/04-database.md) - Supabase/PostGIS詳細
- [API仕様](docs/02-design/03-api-spec.md) - REST API定義

### 🛠️ 開発
- [環境構築](docs/03-development/01-setup.md) - 詳細セットアップ手順
- [コーディング規約](docs/03-development/02-coding-standards.md) - 開発ルール

## 🎯 開発状況

**現在**: MVP開発準備段階 (2025年6月)

- ✅ プロジェクト構造・要件定義
- ✅ Next.js 14環境構築
- ✅ **データベース選定 (Supabase)**
- 🔄 UI実装進行中
- ⏳ 地図表示機能
- ⏳ 外部API連携

### 📊 マイルストーン
- **M1 (完了)**: 環境構築・基盤整備
- **M2 (進行中)**: UI/UX設計・基本機能実装
- **M3 (予定)**: 地図・検索機能完成
- **M4 (予定)**: MVP リリース (8月末予定)

## 🤝 コントリビューション

現在はkpab個人開発中です。

フィードバック・提案は [Issues](https://github.com/kpab/pepino/issues) からお願いします。

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🔗 関連リンク

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostGIS Documentation](https://postgis.net/docs/)

---

**Pepino**: 今すぐ、近くで、リアルな出会いを 🍑
