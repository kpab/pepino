---
sidebar_position: 1
title: 🍑 Pepino - 概要
---

# 🍑 Pepino Documentation

> 現在地周辺のオフラインイベントを「今すぐ」発見・参加できるWebアプリ

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com/)

## 📚 ドキュメント

### 📋 要件・設計
- [🎨 システム設計](./design/) - アーキテクチャ・データベース・API
- [🗄️ データベース設計](./design/database) - PostgreSQL + PostGIS
- [🔐 セキュリティ設計](./design/security)

### 🛠️ 開発ガイド
- [🚀 環境構築](./development/setup) - Next.js + Supabase セットアップ
- [🐙 GitHub Pages設定](./development/github-pages-setup) - ドキュメント公開

### 📊 プロジェクト管理
- [🛠️ 技術選定記録](./project-management/decisions) - ADR
- [📊 ガントチャート](./project-management/gantt-chart) - 詳細スケジュール
- [📈 進捗トラッキング](./project-management/progress-tracking) - 現在の状況
- [📋 TODOリスト](./project-management/todo-list) - 開発タスク一覧

## 🎯 プロジェクト概要

### 核心価値
- **オフライン限定**: リアルな出会いに特化
- **位置情報ベース**: GPS中心の近場イベント表示  
- **即時性**: 「今から2時間後」のような柔軟な参加
- **統合表示**: connpass等外部APIとの連携

### 開発状況
**現在**: MVP開発準備段階 (2025年6月)

- ✅ Next.js 14環境構築完了
- ✅ データベース選定 (Supabase)
- ✅ プロジェクト管理体制確立
- 🔄 UI実装進行中
- ⏳ 地図表示機能

### マイルストーン
- **M1 (完了)**: 環境構築・基盤整備
- **M2 (進行中)**: UI/UX設計・基本機能実装  
- **M3 (予定)**: 地図・検索機能完成
- **M4 (予定)**: MVP リリース (8月末予定)

## 🛠️ 技術構成

### フロントエンド
- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Zustand** (状態管理) + **React Hook Form** + **Zod**

### バックエンド・データベース
- **Supabase** (PostgreSQL + PostGIS)
- **Supabase Realtime** + **Supabase Auth**

### インフラ
- **Vercel** (ホスティング) + **GitHub Actions** (CI/CD)
- **Google Maps API** + **connpass API**

## 🚀 クイックスタート

```bash
# リポジトリクローン
git clone https://github.com/kpab/pepino.git
cd pepino

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.local を編集

# 開発サーバー起動
npm run dev
```

詳細な環境構築手順は [開発環境セットアップ](./development/setup) を参照。

## 📄 ライセンス

MIT License

---

**Pepino**: 今すぐ、近くで、リアルな出会いを 🍑
