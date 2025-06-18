---
sidebar_position: 1
title: 🛠️ 技術選定記録
---

# 🛠️ Pepino - 技術的意思決定記録 (ADR: Architecture Decision Records)

## 📋 概要
このファイルでは、Pepinoプロジェクトにおける重要な技術選定とその理由を記録します。

---

## ADR-001: データベース選定 - Supabase (PostgreSQL + PostGIS)

### 📅 決定日
2025年6月18日

### 🎯 決定内容
メインデータベースとして **Supabase (PostgreSQL + PostGIS)** を採用

### 🤔 検討した選択肢

| 選択肢 | メリット | デメリット | コスト |
|--------|----------|------------|--------|
| **Supabase** | PostGIS地理検索、リアルタイム、認証内蔵、即座開始 | 無料枠制限 | 無料→$25/月 |
| **VPS PostgreSQL** | 完全制御、無制限、高性能 | 運用管理必要 | VPS代のみ |
| **PlanetScale** | ブランチ機能、高性能 | 地理検索弱い | 無料→$29/月 |
| **Firebase** | Google連携、NoSQL | 地理検索制限、複雑クエリ弱い | 無料→$25/月 |

### ✅ 選定理由

#### 1. **位置情報中心アプリに最適**
- PostGIS拡張で強力な地理的検索
- `ST_DWithin`, `ST_Distance`等の地理関数
- 「現在地から5km以内のイベント」が高速検索可能

#### 2. **MVP開発に適している**
- 無料枠500MB（予想使用量50MB）で十分
- セットアップ5分で即座開始可能
- REST API自動生成でNext.js連携が楽

#### 3. **将来の拡張性**
- リアルタイム機能（参加者数即座更新）
- 認証機能内蔵（Google/Twitterログイン）
- Row Level Security (RLS) でセキュリティ確保

#### 4. **プロジェクト状況にマッチ**
- VPS契約済みだが、まずは手軽に開始したい
- MVPまでは無料で運用可能
- 必要に応じてVPS PostgreSQLに移行可能

### 📊 想定使用量（MVP期）
```
- イベント: ~1,000件 (外部API取得分含む)
- 位置情報: 緯度経度 + 住所テキスト
- 将来のユーザー: ~100名
- 参加履歴: ~500件
- 画像: 外部URL参照（容量節約）

合計容量: 約50MB → 無料枠500MB内で余裕
```

### 🔄 移行戦略
**Phase 1 (MVP)**: Supabase無料枠で開始  
**Phase 2 (成長期)**: 使用量に応じてSupabase有料プラン or VPS移行  
**Phase 3 (本格運用)**: 必要に応じてマイクロサービス化

### 📝 実装への影響
- **フロントエンド**: `@supabase/supabase-js` クライアント使用
- **認証**: Supabase Auth（将来実装）
- **リアルタイム**: Supabase Realtime（参加者数等）
- **ファイル**: Supabase Storage（画像アップロード）

### ⚠️ 注意事項・制約
- 無料枠: 500MB + 2プロジェクト + 50MB帯域/月
- RLS (Row Level Security) の理解・設定が必要
- 将来的なベンダーロックインリスク

### 🎯 成功指標
- [ ] 5分以内でのデータベース接続確認
- [ ] 地理的検索クエリの動作確認（1秒以内）
- [ ] Next.js からのCRUD操作確認
- [ ] 1000件のイベントデータでの性能確認

---

## ADR-002: フロントエンド技術スタック

### 📅 決定日
2025年6月18日

### 🎯 決定内容
**Next.js 14 + TypeScript + Tailwind CSS** を採用（既に構築済み）

### ✅ 選定理由
- App Router for モダンな開発体験
- TypeScript for 型安全性
- Tailwind CSS for 高速UI開発
- Vercel デプロイとの親和性

### 📝 実装への影響
- ファイルベースルーティング
- Server Components + Client Components
- Image最適化、フォント最適化
- PWA対応準備済み

---

## 🔮 今後の決定予定

### ⏳ 近日中に決定が必要
1. **状態管理**: Zustand vs Context API vs Jotai
2. **地図表示**: Google Maps vs Mapbox vs Leaflet
3. **外部API**: connpass の他の選択肢
4. **認証方式**: Supabase Auth vs NextAuth.js
5. **デプロイ先**: Vercel vs VPS vs AWS

### 📅 後で決定
1. **モニタリング**: Sentry vs LogRocket
2. **分析**: Google Analytics vs Plausible
3. **CDN**: Cloudflare vs CloudFront
4. **メール送信**: SendGrid vs Resend

---

## 📚 参考資料
- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Next.js + Supabase Integration Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

---

## 📝 更新履歴
| 日付 | 更新内容 | 更新者 |
|------|----------|--------|
| 2025/6/18 | ADR-001, ADR-002 初版作成 | Claude |

**次回更新予定**: 地図表示技術選定時
