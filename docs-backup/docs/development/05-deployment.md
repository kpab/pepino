# デプロイメント

このページでは、Pepinoアプリケーションのデプロイメント戦略と手順を説明します。

## デプロイメント戦略

### 環境構成

```
Production  → Vercel (pepino.app)
Staging     → Vercel (staging.pepino.app)  
Development → localhost:3000
```

### ブランチ戦略

```
main        → Production環境自動デプロイ
develop     → Staging環境自動デプロイ
feature/*   → Preview環境（Pull Request毎）
```

## Vercel デプロイメント

### 設定ファイル

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "env": {
    "NEXT_PUBLIC_APP_ENV": "production"
  },
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["nrt1"],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### 環境変数設定

#### Production
```bash
# Vercel Dashboard での設定
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=production_key
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_anon_key
SUPABASE_SERVICE_ROLE_KEY=production_service_key
```

#### Staging
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=staging_key
NEXT_PUBLIC_SUPABASE_URL=https://xxx-staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=staging_service_key
```

### デプロイメントスクリプト

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "deploy:production": "vercel --prod",
    "deploy:staging": "vercel",
    "deploy:preview": "vercel --no-wait"
  }
}
```

## データベース デプロイメント

### Supabase Migration

```sql
-- migrations/001_initial_schema.sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location POINT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 地理的インデックス
CREATE INDEX idx_events_location ON events USING GIST (location);
```

### マイグレーション実行

```bash
# Supabase CLI使用
supabase db push

# または手動実行
psql -h db.xxx.supabase.co -U postgres -d postgres -f migrations/001_initial_schema.sql
```

## CI/CD パイプライン

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: npm run build

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel (Staging)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel (Production)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
        scope: ${{ secrets.VERCEL_ORG_ID }}
```

### Preview Deployments

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy Preview
      uses: amondnet/vercel-action@v25
      id: vercel-deploy
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        github-comment: true
```

## 監視・ログ

### Vercel Analytics

```typescript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

### エラー監視 (Sentry)

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // PII削除・フィルタリング
    return event
  }
})
```

### パフォーマンス監視

```typescript
// lib/performance.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function reportWebVitals(metric: any) {
  // Google Analytics or カスタム分析に送信
  if (process.env.NODE_ENV === 'production') {
    // gtag('event', metric.name, { ... })
  }
}
```

## セキュリティ対策

### Content Security Policy

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' https://maps.googleapis.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: https:;
              connect-src 'self' https://api.pepino.app https://*.supabase.co;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  }
}
```

### 環境変数の検証

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string()
})

export const env = envSchema.parse(process.env)
```

## ロールバック戦略

### Vercel でのロールバック

```bash
# CLI でのロールバック
vercel rollback [deployment-url]

# または Dashboard から Previous Deployment を再デプロイ
```

### データベースロールバック

```bash
# Supabase でのスキーマロールバック
supabase db reset
supabase db push --local

# 本番環境では慎重に
# 1. データバックアップ
# 2. マイグレーション取り消し
# 3. アプリケーションロールバック
```

## パフォーマンス最適化

### ビルド最適化

```javascript
// next.config.js
module.exports = {
  // 静的ファイル最適化
  images: {
    domains: ['example.com'],
    formats: ['image/avif', 'image/webp']
  },
  
  // バンドル分析
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all'
    }
    return config
  },
  
  // 実験的機能
  experimental: {
    serverComponentsExternalPackages: ['@googlemaps/js-api-loader']
  }
}
```

### CDN設定

```javascript
// Vercel での自動CDN設定
// 静的ファイルは自動的にエッジキャッシュ

// カスタムキャッシュヘッダー
export async function getStaticProps() {
  return {
    props: { ... },
    revalidate: 60 // 60秒でISR
  }
}
```

## デプロイメントチェックリスト

### Pre-deployment
- [ ] 全テストパス
- [ ] セキュリティスキャン実行
- [ ] パフォーマンステスト実行
- [ ] 環境変数確認
- [ ] データベースマイグレーション準備

### Post-deployment
- [ ] ヘルスチェック確認
- [ ] Core Web Vitals 測定
- [ ] エラーログ監視
- [ ] 主要機能動作確認
- [ ] ロールバック手順確認

## トラブルシューティング

### 一般的な問題

```bash
# ビルドエラー
npm run build 2>&1 | tee build.log

# 環境変数問題
vercel env ls
vercel env add VARIABLE_NAME

# デプロイメント失敗
vercel logs [deployment-url]

# データベース接続問題  
supabase status
```

### 緊急時対応

1. **即座のロールバック**: 前バージョンに戻す
2. **監視強化**: エラー率・レスポンス時間
3. **コミュニケーション**: ステータスページ更新
4. **根本原因分析**: ログ・メトリクス確認
5. **修正・再デプロイ**: 問題解決後

[TODO: 運用フェーズでの監視・アラート設定追加]
