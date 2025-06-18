# 🍑 Pepino - Claude プロジェクトナレッジ

## 🎯 プロジェクト概要

**Pepino**は、現在地周辺のオフラインイベントを「今すぐ」発見・参加できる Web アプリです。

### 🔑 核心価値

- **オフライン限定**: リアルな出会いに特化
- **位置情報ベース**: GPS/手動位置から近傍検索
- **即時性**: 「今から 2 時間後」のような柔軟な参加
- **統合表示**: connpass 等外部 API との連携

## 🏗️ 技術構成

### フロントエンド

- **Framework**: Next.js 14.2.4 (App Router)
- **Language**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.4.4
- **State Management**: Zustand 4.5.2
- **Forms**: React Hook Form 7.51.5 + Zod 3.23.8
- **Maps**: Google Maps JavaScript API (@googlemaps/js-api-loader 1.16.6)
- **Utilities**: clsx, tailwind-merge

### バックエンド・データベース

- **Database**: Supabase 2.43.4 (PostgreSQL + PostGIS)
- **Geospatial**: PostGIS for 地理的検索
- **Realtime**: Supabase Realtime
- **Authentication**: Supabase Auth (将来実装)

### インフラ・開発

- **Hosting**: Vercel (予定)
- **Package Manager**: npm 8.0.0+
- **Node.js**: 18.0.0+
- **Development**: ESLint + Prettier

## 📁 実際のプロジェクト構造

```
/projects/pepino/                    # 🎯 実際のプロジェクトパス
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (dashboard)/            # ダッシュボード機能
│   │   ├── api/                    # API Routes
│   │   ├── layout.tsx              # Root Layout
│   │   └── page.tsx                # ホーム画面
│   ├── components/
│   │   ├── features/               # 機能別コンポーネント
│   │   ├── layouts/                # レイアウトコンポーネント
│   │   └── ui/                     # 汎用UIコンポーネント
│   ├── hooks/                      # カスタムフック
│   ├── lib/                        # ユーティリティ・設定
│   ├── stores/                     # Zustand状態管理
│   ├── styles/                     # スタイル定義
│   └── types/                      # TypeScript型定義
├── docs/
│   ├── 01-requirements/            # 要件定義
│   ├── 02-design/                 # 設計書・UI設計
│   ├── 03-development/            # 開発ガイド
│   ├── 04-project-management/     # プロジェクト管理
│   └── assets/                    # ドキュメント用アセット
├── public/                        # 静的ファイル
├── tests/                         # テストファイル
├── website/                       # プロジェクトサイト
├── .github/                       # GitHub Actions
├── AI_CONTEXT.md                  # AI開発コンテキスト
├── CLAUDE_PROJECT_KNOWLEDGE.md    # このナレッジファイル
└── package.json                   # 依存関係定義
```

## 🎨 主要機能 (MVP)

### ユーザー向け機能

1. **ホーム画面**: 現在地周辺の「今すぐ参加可能」イベント表示
2. **検索・フィルター**: 距離・時間・カテゴリ・料金での絞り込み
3. **イベント詳細**: 地図・アクセス・参加者属性・参加ボタン
4. **位置情報設定**: GPS 取得 or 手動設定

### 主催者向け機能

1. **イベント作成**: 基本情報・位置・カテゴリ設定
2. **参加者管理**: 現在の参加状況確認

## 🎯 ユーザージャーニー

```
1. 位置情報許可/設定
2. 現在地周辺のイベント一覧表示
3. 興味のあるイベントをタップ
4. 詳細確認（地図・所要時間・参加者構成）
5. 参加ボタン押下
6. 参加確認・会場案内
```

## 🔧 開発ルール

### コード規約

- TypeScript 必須（any 禁止）
- Function コンポーネント使用
- PascalCase: コンポーネント名
- camelCase: フック・ユーティリティ
- kebab-case: ファイル名（一部除く）

### フォルダ規約

- `/app/`: Next.js App Router
- `/components/ui/`: 汎用 UI コンポーネント
- `/components/features/`: 機能特化コンポーネント
- `/components/layouts/`: レイアウトコンポーネント
- `/hooks/`: カスタムフック (useXxx)
- `/stores/`: Zustand ストア
- `/types/`: 型定義 (XxxType.ts)
- `/lib/`: ユーティリティ・設定

## 🚀 開発状況

**現在**: MVP 開発段階

- ✅ プロジェクト構造作成
- ✅ 要件定義・機能設計
- ✅ **Next.js 14環境構築完了**
- ✅ **全依存関係インストール済み**
- ✅ **基本ディレクトリ構造作成済み**
- ✅ **データベース選定 (Supabase)**
- 🔄 **基本UI実装中**
- ⏳ 地図機能実装待ち
- ⏳ 外部API連携待ち

### インストール済み主要パッケージ

**Core Dependencies:**

- Next.js 14.2.4
- React 18.3.1
- TypeScript 5.2.2
- Supabase JS 2.43.4
- Tailwind CSS 3.4.4

**State & Forms:**

- Zustand 4.5.2
- React Hook Form 7.51.5
- Zod 3.23.8

**Maps & Utilities:**

- Google Maps JS API Loader 1.16.6
- clsx 2.1.1
- tailwind-merge 2.3.0

## 💡 Claude 支援時の重要ポイント

### プロジェクトアクセス

- **実際のパス**: `/projects/pepino/`
- **主要ファイル**:
  - メインページ: `/projects/pepino/src/app/page.tsx`
  - レイアウト: `/projects/pepino/src/app/layout.tsx`
  - 設定: `/projects/pepino/package.json`
  - ドキュメント: `/projects/pepino/docs/`

### 常に意識すべき点

1. **オフライン限定**: オンラインイベントは除外
2. **位置情報中心**: 距離・移動時間が重要な選択要素
3. **即時性**: 「今すぐ」参加可能性を重視
4. **モバイルファースト**: スマホでの使いやすさ優先
5. **パフォーマンス**: 地図・位置情報処理の最適化

### 技術的注意点

- 位置情報のプライバシー配慮
- Google Maps API 料金対策
- 外部 API (connpass 等) のレート制限
- PWA 対応（オフライン機能、位置情報バックグラウンド取得）
- Next.js App Router の特性を活用

### UI/UX 原則

- **直感的操作**: 複雑な設定不要
- **視覚的距離感**: 「徒歩 5 分」「電車 12 分」など
- **信頼感**: 参加者構成・主催者実績表示
- **安心感**: イベント詳細・アクセス情報充実

## 📋 よくある質問・課題

### Q: オンラインとオフラインの混在は？

A: Pepino はオフライン限定。オンラインイベントは対象外

### Q: 位置情報を許可しない場合は？

A: 手動で駅名・地域名入力で代替

### Q: 主要競合との差別化は？

A: 地理的近さ + 即時参加可能性 + オフライン限定

### Q: 収益化方針は？

A: 主催者向け有料プラン・会場マッチング手数料（MVP 後）

## 🎯 次のマイルストーン

1. ✅ **環境構築・依存関係**: 完了
2. 🔄 **基本UI実装**: 進行中
3. ⏳ **地図機能実装**: 待機中
4. ⏳ **データベース接続**: 待機中
5. ⏳ **外部API連携**: 待機中
6. ⏳ **テスト・調整**: 待機中
7. ⏳ **MVP デプロイ**: 待機中

## 🛠️ 開発コマンド

```bash
# 開発サーバー起動
cd /projects/pepino
npm run dev

# ビルド
npm run build

# リント・フォーマット
npm run lint:fix
npm run format

# 型チェック
npm run type-check
```

---

**最終更新**: 2025 年 6 月 18 日 | **ステータス**: MVP開発段階
**プロジェクトパス**: `/projects/pepino/`
