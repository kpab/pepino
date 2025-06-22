# システムアーキテクチャ

このページでは、Pepinoアプリケーションのシステムアーキテクチャについて説明します。

## 概要

Pepinoは位置情報ベースのオフラインイベント発見アプリケーションです。

## アーキテクチャ概要

### フロントエンド
- **Framework**: Next.js 14.2.4 (App Router)
- **Language**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.4.4
- **State Management**: Zustand 4.5.2
- **Maps**: Google Maps JavaScript API

### バックエンド
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Geospatial**: PostGIS for 地理的検索
- **Realtime**: Supabase Realtime
- **Authentication**: Supabase Auth

### インフラ
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Database**: Supabase Cloud

## システム構成図

[TODO: システム構成図を追加]

## データフロー

[TODO: データフローの詳細を記述]

## セキュリティ考慮事項

[TODO: セキュリティアーキテクチャの詳細を記述]
