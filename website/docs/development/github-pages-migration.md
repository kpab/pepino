---
sidebar_position: 7
title: GitHub Pages切り替えガイド
description: 従来のマークダウン表示からDocusaurusへの移行手順
---

# 🔄 GitHub Pages切り替えガイド

## 📋 現在の状況

現在、2つのワークフローが並行運用されています：

| ワークフロー | トリガー | 用途 |
|-------------|----------|------|
| `deploy-docs.yml` | `docs/**` 変更 | 従来のマークダウン直表示 |
| `deploy-docusaurus.yml` | `website/**` 変更 | 🆕 Docusaurusサイト |

## 🚀 Docusaurusサイトへの切り替え手順

### Step 1: GitHub リポジトリ設定

1. **GitHub リポジトリにアクセス**
   ```
   https://github.com/kpab/pepino
   ```

2. **Settings → Pages**
   - **Source**: `GitHub Actions` （既に設定済みのはず）
   - **Custom domain**: 設定済みの場合はそのまま

### Step 2: テストデプロイ実行

```bash
# 1. websiteフォルダの変更をコミット・プッシュ
cd /projects/pepino
git add website/
git commit -m "🦖 Add Docusaurus documentation site"
git push origin main

# 2. GitHub Actionsで自動デプロイ確認
# https://github.com/kpab/pepino/actions で確認
```

### Step 3: 動作確認

1. **GitHub Pages URL確認**
   ```
   https://kpab.github.io/pepino/
   ```

2. **確認ポイント**
   - ✅ Docusaurusサイトが表示される
   - ✅ ナビゲーションが動作する  
   - ✅ 検索機能が動作する
   - ✅ 内部リンクが正常動作する

### Step 4: 旧ワークフロー無効化（推奨）

Docusaurusサイトが正常動作したら：

```bash
# 旧ワークフローのファイル名変更（無効化）
mv .github/workflows/deploy-docs.yml .github/workflows/deploy-docs.yml.disabled

# コミット
git add .github/workflows/
git commit -m "🔧 Disable old markdown deployment workflow"
git push origin main
```

## 🔧 トラブルシューティング

### よくある問題

#### 1. ワークフローが実行されない
**原因**: パストリガーの問題
```bash
# websiteフォルダ内のファイルを変更していることを確認
touch website/docs/test.md
git add website/docs/test.md
git commit -m "test: trigger deployment"
git push origin main
```

#### 2. ビルドエラー
**確認点**:
- `website/package.json` の依存関係
- `website/docusaurus.config.ts` の設定
- Node.js バージョン（18.x必須）

#### 3. 404エラー
**確認点**:
- `baseUrl: '/pepino/'` の設定
- GitHub Pages のカスタムドメイン設定
- ファイルパスの大文字小文字

#### 4. CSS/スタイルが適用されない
**確認点**:
- Tailwind CSS の設定
- Docusaurus の CSS 読み込み順序

## 📊 移行メリット確認

### Before vs After

| 項目 | 従来 | Docusaurus |
|------|------|------------|
| **見た目** | 基本的なHTML | ✨ モダンなUI |
| **ナビゲーション** | 手動リンク | 🗂️ 自動サイドバー |
| **検索** | なし | 🔍 全文検索 |
| **レスポンシブ** | 基本的 | 📱 完全対応 |
| **編集性** | マークダウン | マークダウン（同じ） |
| **パフォーマンス** | 普通 | ⚡ 高速（SSG） |

## 🎯 成功確認チェックリスト

### デプロイ成功
- [ ] GitHub Actions が緑✅で完了
- [ ] https://kpab.github.io/pepino/ にアクセス可能
- [ ] Pepinoブランディング（🍑）が表示される

### 機能確認  
- [ ] サイドバーナビゲーション動作
- [ ] ドキュメント間リンク動作
- [ ] 検索ボックス動作（コンテンツ検索）
- [ ] モバイル表示対応

### コンテンツ確認
- [ ] intro ページ表示
- [ ] データベース設計ページ表示
- [ ] 開発ガイドページ表示  
- [ ] 技術選定記録ページ表示

### パフォーマンス確認
- [ ] ページ読み込み < 2秒
- [ ] 画像最適化動作
- [ ] PWA機能（将来）

## 🔄 ロールバック手順

問題が発生した場合の緊急ロールバック：

```bash
# 1. 旧ワークフローを再有効化
mv .github/workflows/deploy-docs.yml.disabled .github/workflows/deploy-docs.yml

# 2. 新ワークフローを無効化
mv .github/workflows/deploy-docusaurus.yml .github/workflows/deploy-docusaurus.yml.disabled

# 3. docs フォルダを更新してトリガー
touch docs/README.md
git add docs/README.md .github/workflows/
git commit -m "🔙 Rollback to markdown deployment"  
git push origin main
```

## 🎉 移行完了後

### 今後の運用
- ドキュメント更新: `website/docs/` フォルダで作業
- 自動デプロイ: `website/**` の変更で自動実行
- 旧 `docs/` フォルダ: 開発用として維持

### さらなる改善
- 🔍 Algolia DocSearch 追加
- 🌍 多言語対応（日本語・英語）
- 📊 Google Analytics 追加
- 🎨 カスタムテーマ適用

---

これで**見やすく検索可能で管理しやすい**ドキュメントサイトの完成です！🎉
