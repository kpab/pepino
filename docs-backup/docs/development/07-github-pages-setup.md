---
sidebar_position: 2
title: 🚀 GitHub Pages設定
---

# 🚀 GitHub Pages 設定手順

## 📋 実際の設定ステップ

### ステップ 1: GitHub リポジトリでPages設定

1. **GitHubリポジトリにアクセス**
   ```
   https://github.com/kpab/pepino
   ```

2. **Settings タブをクリック**

3. **左サイドバーの「Pages」をクリック**

4. **Source設定**
   - Source: `GitHub Actions` を選択
   - ~~Deploy from a branch は選択しない~~

### ステップ 2: 作成されたファイルをコミット・プッシュ

現在作成されたファイル：
- `docs/README.md` - ドキュメントサイトのトップページ
- `.github/workflows/deploy-docs.yml` - 自動デプロイワークフロー  
- `.nojekyll` - Jekyll無効化

```bash
# 現在のディレクトリで実行
git add docs/README.md
git add .github/workflows/deploy-docs.yml
git add .nojekyll
git commit -m "🚀 GitHub Pages自動デプロイ設定"
git push origin main
```

### ステップ 3: 自動デプロイ確認

1. **GitHub リポジトリの「Actions」タブ確認**
   - "Deploy Documentation to GitHub Pages" ワークフローが実行中
   - 緑のチェックマーク ✅ で成功確認

2. **Pages設定画面で URL確認**
   ```
   Your site is published at:
   https://kpab.github.io/pepino/
   ```

### ステップ 4: 表示確認

ブラウザで以下にアクセス：
- **メインページ**: https://kpab.github.io/pepino/
- **ナビゲーション**: https://kpab.github.io/pepino/navigation.html

---

## 🔧 トラブルシューティング

### よくある問題

#### 1. "GitHub Pages source saved" が表示されない
**解決策**: 
- Settings → Pages で Source を `GitHub Actions` に設定
- Repository settings → Actions → General で "Allow GitHub Actions" を有効化

#### 2. 404 エラーが表示される
**解決策**:
- Actions タブでワークフローの成功を確認
- 数分待ってからアクセス（反映に時間がかかる場合）

#### 3. CSS スタイルが適用されない
**解決策**:
- `.nojekyll` ファイルが存在するか確認
- Tailwind CDN リンクが正しいか確認

---

## 📈 次のステップ

### 今すぐ実行
1. ✅ 上記ファイル作成完了
2. ⏳ **Git コミット・プッシュ実行**
3. ⏳ **GitHub Pages設定**
4. ⏳ **デプロイ確認**

### 今後の改善予定
- VitePress導入 (より美しいデザイン)
- 検索機能追加
- Mermaid図表の表示改善
- 自動目次生成

---

## 🎯 成功指標

- [ ] GitHub Pages URL でアクセス可能
- [ ] ドキュメント一覧が表示される
- [ ] 各マークダウンファイルにアクセス可能
- [ ] GitHub Actions が自動実行される

**実際にGitHub Pagesを設定してみましょう！**
