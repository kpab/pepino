# 🛠️ Pepino - 開発環境セットアップ

## 📋 概要
Pepino開発環境の構築手順書

## 🔧 前提条件

### 必須環境
- **Node.js**: 18.x以上
- **npm**: 8.x以上
- **Git**: 最新版
- **ブラウザ**: Chrome, Firefox, Safari（位置情報テスト用）

### 推奨環境
- **エディタ**: VS Code + 推奨拡張機能
- **ターミナル**: iTerm2 (Mac) / Windows Terminal (Windows)

---

## 🚀 セットアップ手順

### 1. リポジトリクローン

```bash
# GitHubからクローン
git clone https://github.com/kpab/pepino.git
cd pepino

# 依存関係インストール
npm install
```

### 2. 環境変数設定

```bash
# 環境変数ファイル作成
cp .env.example .env.local

# .env.local を編集（後述のデータベース設定完了後）
```

### 3. 🗄️ データベース設定 (Supabase)

#### 3.1 Supabaseアカウント作成

1. [https://supabase.com](https://supabase.com) でアカウント作成
2. 「New Project」をクリック
3. プロジェクト設定：
   ```
   Name: pepino-dev
   Database Password: 安全なパスワード（記録必須）
   Region: Northeast Asia (ap-northeast-1) - 東京
   ```
4. プロジェクト作成完了（2-3分待機）

#### 3.2 PostGIS拡張有効化

1. Supabase Dashboard → SQL Editor
2. 以下を実行：
   ```sql
   -- PostGIS拡張（地理的検索用）
   CREATE EXTENSION IF NOT EXISTS postgis;
   
   -- 確認クエリ
   SELECT postgis_version();
   ```

#### 3.3 データベース構造作成

1. SQL Editorで以下を順次実行：

```sql
-- メインテーブル作成
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'networking', 'workshop', 'seminar', 'sports', 
    'cultural', 'food', 'music', 'art', 'tech', 
    'business', 'hobby', 'volunteer', 'other'
  )),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location_name TEXT NOT NULL,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT) NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  price INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'JPY',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  external_url TEXT,
  external_id TEXT,
  external_source TEXT,
  organizer_name TEXT,
  organizer_contact TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX events_location_idx ON events USING GIST (location);
CREATE INDEX events_category_idx ON events (category);
CREATE INDEX events_start_time_idx ON events (start_time);
CREATE UNIQUE INDEX events_external_id_source_idx ON events (external_id, external_source) 
WHERE external_id IS NOT NULL;

-- サンプルデータ投入
INSERT INTO events (title, description, category, start_time, end_time, location_name, address, location) VALUES 
  (
    'Next.js勉強会 @渋谷', 
    'Next.js 14の新機能について学ぼう！初心者歓迎',
    'tech',
    NOW() + INTERVAL '2 hours',
    NOW() + INTERVAL '4 hours',
    '渋谷ヒカリエ 11F',
    '東京都渋谷区渋谷2-21-1',
    ST_Point(139.7036, 35.6591)
  ),
  (
    'お花見交流会 @上野',
    '桜を見ながらピクニック交流しませんか？',
    'cultural', 
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day 3 hours',
    '上野公園 桜通り',
    '東京都台東区上野公園5-20',
    ST_Point(139.7744, 35.7141)
  ),
  (
    'スタートアップピッチ @新宿',
    '起業家による事業プレゼン大会',
    'business',
    NOW() + INTERVAL '6 hours',
    NOW() + INTERVAL '8 hours',
    '新宿パークタワー',
    '東京都新宿区西新宿3-7-1',
    ST_Point(139.6917, 35.6895)
  );
```

2. 検索関数作成：

```sql
-- 近傍イベント検索関数
CREATE OR REPLACE FUNCTION get_nearby_events(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km FLOAT DEFAULT 5,
  category_filter TEXT[] DEFAULT NULL,
  max_hours_ahead FLOAT DEFAULT 24,
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  location_name TEXT,
  address TEXT,
  distance_km FLOAT,
  current_participants INT,
  max_participants INT,
  price INT,
  currency TEXT,
  tags TEXT[],
  image_url TEXT,
  external_url TEXT,
  organizer_name TEXT,
  is_available_now BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.description,
    e.category,
    e.start_time,
    e.end_time,
    e.location_name,
    e.address,
    ROUND(ST_Distance(e.location, ST_Point(user_lng, user_lat)::geography) / 1000.0, 2) as distance_km,
    e.current_participants,
    e.max_participants,
    e.price,
    e.currency,
    e.tags,
    e.image_url,
    e.external_url,
    e.organizer_name,
    (e.start_time <= NOW() + INTERVAL '2 hours' AND e.start_time > NOW()) as is_available_now
  FROM events e
  WHERE 
    ST_DWithin(e.location, ST_Point(user_lng, user_lat)::geography, radius_km * 1000)
    AND e.start_time > NOW()
    AND e.start_time < NOW() + (max_hours_ahead || ' hours')::INTERVAL
    AND e.is_online = FALSE
    AND (category_filter IS NULL OR e.category = ANY(category_filter))
  ORDER BY 
    is_available_now DESC,
    distance_km ASC,
    e.start_time ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

#### 3.4 接続情報取得

1. Supabase Dashboard → Settings → API
2. 以下の情報をコピー：
   - **Project URL**
   - **anon/public key**
   - **service_role key** (secret)

#### 3.5 環境変数設定

`.env.local` を編集：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 開発用設定
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
NEXT_PUBLIC_MOCK_USER_LOCATION_LAT=35.6762
NEXT_PUBLIC_MOCK_USER_LOCATION_LNG=139.6503
```

### 4. Supabaseクライアント依存関係

```bash
# Supabase JavaScript クライアント
npm install @supabase/supabase-js
```

### 5. 開発サーバー起動

```bash
# 開発サーバー起動
npm run dev

# ブラウザで確認
open http://localhost:3000
```

### 6. データベース接続確認

ブラウザの開発者ツールのコンソールで以下を実行：

```javascript
// Next.jsアプリ内でテスト
fetch('/api/test-db')
  .then(res => res.json())
  .then(console.log);
```

または、Supabase Dashboard → SQL Editor で：

```sql
-- 動作確認
SELECT get_nearby_events(35.6762, 139.6503, 10);
```

---

## 🎨 VS Code推奨設定

### 推奨拡張機能

```json
// .vscode/extensions.json（プロジェクトルートに作成）
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode", 
    "ms-typescript.typescript-importer",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.sublime-keybindings",
    "usernamehw.errorlens",
    "gruntfuggly.todo-tree"
  ]
}
```

### VS Code設定

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

---

## 🧪 テスト環境設定（将来実装）

### Jest設定
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### Playwright（E2E）設定
```bash
npm install --save-dev @playwright/test
npx playwright install
```

---

## 🗺️ 地図機能設定（将来実装）

### Google Maps API設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. Maps JavaScript API 有効化
3. APIキー作成・制限設定
4. 環境変数追加：
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

---

## 🚨 トラブルシューティング

### よくある問題

#### 1. Node.jsバージョンエラー
```bash
# Node.js 18+ 確認
node --version

# nvmでバージョン管理（推奨）
nvm install 18
nvm use 18
```

#### 2. Supabase接続エラー
```bash
# 環境変数確認
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# .env.local の存在確認
ls -la .env.local
```

#### 3. PostGIS関数エラー
```sql
-- PostGIS拡張確認
SELECT name, default_version, installed_version 
FROM pg_available_extensions 
WHERE name = 'postgis';

-- 再有効化
DROP EXTENSION IF EXISTS postgis CASCADE;
CREATE EXTENSION postgis;
```

#### 4. 位置情報取得エラー
- **HTTPS必須**: 本番環境では位置情報にHTTPS必要
- **ブラウザ許可**: ブラウザ設定で位置情報許可
- **モック使用**: 開発時は`ENABLE_MOCK_DATA=true`で代替

---

## ✅ セットアップ確認チェックリスト

### 基本環境
- [ ] Node.js 18+ インストール済み
- [ ] リポジトリクローン完了
- [ ] npm install 完了
- [ ] VS Code + 拡張機能設定

### データベース
- [ ] Supabaseアカウント作成
- [ ] PostGIS拡張有効化
- [ ] テーブル・関数作成完了
- [ ] サンプルデータ投入確認
- [ ] 環境変数設定完了

### アプリケーション
- [ ] 開発サーバー起動（`npm run dev`）
- [ ] http://localhost:3000 アクセス可能
- [ ] ホーム画面表示確認
- [ ] ブラウザコンソールエラーなし
- [ ] 位置情報取得動作確認

### 次のステップ
- [ ] GitHub Projects設定
- [ ] 最初の機能実装開始
- [ ] CI/CD設定

---

## 📚 参考リンク

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🔄 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|----------|--------|
| 2025/6/18 | 初版作成（Supabase設定含む） | Claude |

次回更新予定: GitHub Projects設定手順追加時
