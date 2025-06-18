# Pepino - AI開発コンテキスト

## 🎯 プロジェクト要約
オフライン限定イベントの位置情報ベース検索・参加アプリ

## 🏗️ 技術スタック
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **State**: Zustand
- **Database**: PostgreSQL + PostGIS（予定）
- **Maps**: Google Maps API
- **Deploy**: Vercel

## 🎨 主要機能
1. 現在地周辺のイベント検索
2. 距離・時間・カテゴリでのフィルタリング
3. イベント詳細表示・参加機能
4. イベント作成機能（主催者向け）

## 📁 重要ファイル
- `src/app/page.tsx` - ホーム画面
- `src/components/features/` - 機能別コンポーネント
- `docs/01-requirements/04-features.md` - 詳細機能仕様
- `docs/02-design/` - 設計資料

## 🚀 開発状況
現在MVP開発段階。基本機能から実装中。

## 💡 AI開発時の注意点
- 位置情報APIの取り扱いに注意
- レスポンシブデザイン必須
- SEO対応（SSG/SSR）
- パフォーマンス重視
