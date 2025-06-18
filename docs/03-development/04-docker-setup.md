# 🐳 Pepino - Docker環境構築ガイド

## 📋 概要
開発環境のDocker化による環境統一・セットアップ簡素化

**優先度**: 中（Week 4 で実装予定）

---

## 🎯 Docker化の目的

### メリット
- ✅ **環境統一**: 開発者間の環境差異解消
- ✅ **簡単セットアップ**: 新メンバーの参加障壁を下げる
- ✅ **本番環境近似**: ローカルと本番の差異を最小化
- ✅ **依存関係管理**: Node.js・PostgreSQL版本管理

### 使用シーン
- 新開発者の環境構築
- CI/CD環境での自動テスト
- 本番環境のローカル再現

---

## 📦 Docker構成設計

### サービス構成

```yaml
services:
  app:          # Next.jsアプリ
  db:           # PostgreSQL + PostGIS  
  redis:        # キャッシュ（将来実装）
  nginx:        # リバースプロキシ（本番用）
```

### ネットワーク

```
┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   PostgreSQL    │
│   (port: 3000)  │◄──►│   (port: 5432)  │
│                 │    │   + PostGIS     │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Host Browser  │
│ (localhost:3000)│
└─────────────────┘
```

---

## 🔧 Docker設定ファイル

### 1. 開発用 Dockerfile

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

# 作業ディレクトリ設定
WORKDIR /app

# 依存関係ファイルコピー（キャッシュ最適化）
COPY package*.json ./

# 依存関係インストール
RUN npm ci

# アプリケーションコードコピー
COPY . .

# ポート公開
EXPOSE 3000

# 開発サーバー起動
CMD ["npm", "run", "dev"]
```

### 2. 本番用 Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 本番用イメージ
FROM node:18-alpine AS runner

WORKDIR /app

# 必要なファイルのみコピー
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. docker-compose.yml (開発用)

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Next.jsアプリケーション
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules  # node_modules除外
      - /app/.next         # .next除外
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - DATABASE_URL=postgresql://postgres:password@db:5432/pepino_dev
    depends_on:
      - db
    networks:
      - pepino-network

  # PostgreSQL + PostGIS
  db:
    image: postgis/postgis:15-3.3
    environment:
      - POSTGRES_DB=pepino_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - pepino-network

  # Redis（将来実装）
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - pepino-network

volumes:
  postgres_data:
  redis_data:

networks:
  pepino-network:
    driver: bridge
```

### 4. 本番用 docker-compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    networks:
      - pepino-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - pepino-network

networks:
  pepino-network:
    driver: bridge
```

---

## 🚀 セットアップ手順

### 1. Docker環境準備

```bash
# Docker Desktop インストール（macOS/Windows）
# または Docker Engine インストール（Linux）

# インストール確認
docker --version
docker-compose --version
```

### 2. データベース初期化スクリプト

```sql
-- scripts/init-db.sql
-- PostGIS拡張有効化
CREATE EXTENSION IF NOT EXISTS postgis;

-- 開発用サンプルデータ
INSERT INTO events (title, description, category, start_time, end_time, location_name, address, location) 
VALUES 
  (
    'Docker Test Event',
    'Docker環境でのテストイベント',
    'tech',
    NOW() + INTERVAL '2 hours',
    NOW() + INTERVAL '4 hours',
    'Dockerコンテナ内',
    'localhost:3000',
    ST_Point(139.6917, 35.6895)
  );

-- 確認クエリ
SELECT * FROM events;
SELECT postgis_version();
```

### 3. 環境変数設定

```bash
# .env.docker
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000  # ローカルSupabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_key
DATABASE_URL=postgresql://postgres:password@db:5432/pepino_dev
REDIS_URL=redis://redis:6379
```

### 4. Docker実行

```bash
# 開発環境起動
docker-compose up -d

# ログ確認
docker-compose logs -f app

# データベース接続確認
docker-compose exec db psql -U postgres -d pepino_dev -c "SELECT postgis_version();"

# 停止
docker-compose down

# 完全削除（データ含む）
docker-compose down -v
```

---

## 🛠️ 開発ワークフロー

### 日次開発フロー

```bash
# 1. 朝の環境起動
docker-compose up -d

# 2. 開発作業
# ブラウザで http://localhost:3000 アクセス
# VSCodeで通常通り開発

# 3. 依存関係追加時
docker-compose exec app npm install new-package
docker-compose restart app

# 4. 夕方の環境停止
docker-compose down
```

### データベース操作

```bash
# PostgreSQL接続
docker-compose exec db psql -U postgres -d pepino_dev

# データベースバックアップ
docker-compose exec db pg_dump -U postgres pepino_dev > backup.sql

# データベース復元
docker-compose exec -T db psql -U postgres -d pepino_dev < backup.sql

# マイグレーション実行
docker-compose exec app npm run db:migrate
```

---

## 🧪 テスト環境Docker

### テスト用構成

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  app-test:
    build:
      context: .
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://postgres:password@db-test:5432/pepino_test
    command: npm run test
    depends_on:
      - db-test
    networks:
      - test-network

  db-test:
    image: postgis/postgis:15-3.3
    environment:
      - POSTGRES_DB=pepino_test
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    tmpfs:
      - /var/lib/postgresql/data  # メモリ上で高速テスト
    networks:
      - test-network

networks:
  test-network:
    driver: bridge
```

### CI/CD用Dockerfile

```dockerfile
# Dockerfile.ci
FROM node:18-alpine

WORKDIR /app

# 依存関係インストール
COPY package*.json ./
RUN npm ci

# アプリケーションコピー
COPY . .

# テスト実行
RUN npm run test
RUN npm run build

# 成功時のみ後続ステップへ
CMD ["echo", "Build and test completed successfully"]
```

---

## 📊 パフォーマンス最適化

### イメージサイズ最適化

```dockerfile
# マルチステージビルドでサイズ削減
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY package.json ./

CMD ["npm", "start"]
```

### .dockerignore設定

```
# .dockerignore
node_modules
.next
.git
.gitignore
README.md
Dockerfile*
docker-compose*
.env.local
.env*.local
coverage
.nyc_output
*.log
```

---

## 🔧 トラブルシューティング

### よくある問題

#### 1. ポート競合
```bash
# 使用中ポート確認
lsof -i :3000
lsof -i :5432

# 別ポート使用
docker-compose up -d --scale app=0
docker-compose run --service-ports -p 3001:3000 app
```

#### 2. ボリューム権限問題
```bash
# 権限修正
docker-compose exec app chown -R node:node /app

# または Dockerfileで修正
USER node
```

#### 3. データベース接続エラー
```bash
# ネットワーク確認
docker-compose exec app ping db

# 環境変数確認
docker-compose exec app env | grep DATABASE
```

#### 4. ホットリロード不動作
```dockerfile
# package.jsonのscriptsを修正
"dev": "next dev --hostname 0.0.0.0"
```

---

## 🚀 実装スケジュール

### Week 4 (6/25-7/1): Docker基本実装

| 日付 | タスク | 工数 |
|------|--------|------|
| 6/25 | Dockerfile.dev作成・テスト | 2h |
| 6/26 | docker-compose.yml作成 | 2h |
| 6/27 | PostgreSQL統合・テスト | 2h |

### Week 5 (7/2-7/8): Docker最適化

| タスク | 工数 |
|--------|------|
| 本番用Dockerfile作成 | 2h |
| CI/CD用Docker統合 | 2h |
| パフォーマンス最適化 | 1h |

---

## 📚 参考リンク

- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostGIS Docker Image](https://hub.docker.com/r/postgis/postgis)
- [Next.js Docker Example](https://github.com/vercel/next.js/tree/canary/examples/with-docker)

---

## 🔄 更新履歴

| 日付 | 更新内容 | 担当 |
|------|----------|------|
| 2025/6/18 | Docker構成設計・基本設定作成 | Claude |

次回更新: Docker実装完了時（Week 4）
