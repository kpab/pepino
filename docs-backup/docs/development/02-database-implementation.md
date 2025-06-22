# 🛠️ Pepino - データベース実装ガイド

## 📋 概要
Supabase PostgreSQL + PostGISの具体的な実装手順とSQL詳細

**関連ドキュメント**: [データベース設計](../design/04-database.md)

---

## 🚀 セットアップ手順

### 1. Supabaseプロジェクト作成

```bash
# 1. https://supabase.com でアカウント作成
# 2. "New Project" でプロジェクト作成
#    - Name: pepino-dev (または pepino-prod)
#    - Region: Northeast Asia (ap-northeast-1)
#    - Password: 強固なパスワード設定
```

### 2. PostGIS拡張有効化

```sql
-- Supabase Dashboard → SQL Editor で実行
CREATE EXTENSION IF NOT EXISTS postgis;

-- 確認
SELECT postgis_version();
```

### 3. テーブル作成

#### 3.1 メインテーブル

```sql
-- イベント管理テーブル
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
  location GEOGRAPHY(POINT) NOT NULL, -- PostGIS地理的ポイント (lng, lat)
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  price INTEGER DEFAULT 0, -- 円単位
  currency TEXT DEFAULT 'JPY',
  tags TEXT[] DEFAULT '{}', -- 配列形式のタグ
  image_url TEXT,
  external_url TEXT, -- connpass等の元ページ
  external_id TEXT, -- 外部APIのID（重複防止）
  external_source TEXT, -- 'connpass', 'doorkeeper', 'manual' etc
  organizer_name TEXT,
  organizer_contact TEXT,
  is_online BOOLEAN DEFAULT FALSE, -- Pepinoはオフライン限定だが将来の拡張用
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ユーザー位置履歴テーブル
CREATE TABLE user_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL, -- セッションベース（ユーザー登録前）
  location GEOGRAPHY(POINT) NOT NULL,
  address TEXT,
  accuracy FLOAT, -- GPS精度（メートル）
  source TEXT CHECK (source IN ('gps', 'manual', 'ip')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 検索ログテーブル
CREATE TABLE event_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  search_location GEOGRAPHY(POINT),
  search_radius_km FLOAT DEFAULT 5,
  category_filter TEXT[],
  results_count INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2 インデックス作成

```sql
-- 地理的検索用（最重要）
CREATE INDEX events_location_idx ON events USING GIST (location);

-- カテゴリ検索用
CREATE INDEX events_category_idx ON events (category);

-- 開始時間検索用（「今すぐ」参加可能検索）
CREATE INDEX events_start_time_idx ON events (start_time);

-- 外部ID重複防止用
CREATE UNIQUE INDEX events_external_id_source_idx ON events (external_id, external_source) 
WHERE external_id IS NOT NULL;

-- 複合検索用（位置+時間+カテゴリ）
CREATE INDEX events_search_idx ON events (category, start_time) 
WHERE start_time > NOW();

-- ユーザー位置履歴用
CREATE INDEX user_locations_session_idx ON user_locations (session_id, created_at DESC);

-- 検索ログ用
CREATE INDEX event_searches_created_at_idx ON event_searches (created_at DESC);
CREATE INDEX event_searches_location_idx ON event_searches USING GIST (search_location);
```

---

## 🔍 主要SQL関数

### 1. 近傍イベント検索関数

```sql
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
    -- 2時間以内に開始するイベントを「今すぐ」とする
    (e.start_time <= NOW() + INTERVAL '2 hours' AND e.start_time > NOW()) as is_available_now
  FROM events e
  WHERE 
    -- 地理的制約
    ST_DWithin(e.location, ST_Point(user_lng, user_lat)::geography, radius_km * 1000)
    -- 時間制約
    AND e.start_time > NOW()
    AND e.start_time < NOW() + (max_hours_ahead || ' hours')::INTERVAL
    -- オフライン限定
    AND e.is_online = FALSE
    -- カテゴリフィルター（オプショナル）
    AND (category_filter IS NULL OR e.category = ANY(category_filter))
    -- 定員チェック（オプショナル）
    AND (e.max_participants IS NULL OR e.current_participants < e.max_participants)
  ORDER BY 
    is_available_now DESC, -- 「今すぐ」が最優先
    distance_km ASC,       -- 距離順
    e.start_time ASC       -- 開始時間順
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

### 2. イベント重複チェック関数

```sql
CREATE OR REPLACE FUNCTION check_event_duplicate(
  p_external_id TEXT,
  p_external_source TEXT,
  p_title TEXT,
  p_start_time TIMESTAMPTZ,
  p_location_lng FLOAT,
  p_location_lat FLOAT
)
RETURNS UUID AS $$
DECLARE
  existing_id UUID;
BEGIN
  -- 外部IDでの完全一致チェック
  IF p_external_id IS NOT NULL THEN
    SELECT id INTO existing_id
    FROM events 
    WHERE external_id = p_external_id 
      AND external_source = p_external_source;
    
    IF existing_id IS NOT NULL THEN
      RETURN existing_id;
    END IF;
  END IF;
  
  -- タイトル + 時間 + 位置での類似チェック
  SELECT id INTO existing_id
  FROM events
  WHERE title = p_title
    AND ABS(EXTRACT(EPOCH FROM (start_time - p_start_time))) < 3600 -- 1時間以内
    AND ST_DWithin(
      location, 
      ST_Point(p_location_lng, p_location_lat)::geography, 
      100 -- 100m以内
    );
  
  RETURN existing_id;
END;
$$ LANGUAGE plpgsql;
```

### 3. Connpass API データ変換関数

```sql
CREATE OR REPLACE FUNCTION import_connpass_event(
  connpass_data JSONB
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
  event_location GEOGRAPHY;
BEGIN
  -- 座標変換（文字列 → 地理的ポイント）
  event_location := ST_Point(
    (connpass_data->>'lon')::FLOAT,
    (connpass_data->>'lat')::FLOAT
  )::geography;
  
  -- 重複チェック
  event_id := check_event_duplicate(
    (connpass_data->>'event_id')::TEXT,
    'connpass',
    connpass_data->>'title',
    (connpass_data->>'started_at')::TIMESTAMPTZ,
    (connpass_data->>'lon')::FLOAT,
    (connpass_data->>'lat')::FLOAT
  );
  
  -- 新規作成または更新
  INSERT INTO events (
    title, description, category, start_time, end_time,
    location_name, address, location, max_participants,
    current_participants, external_url, external_id, external_source,
    organizer_name
  ) VALUES (
    connpass_data->>'title',
    connpass_data->>'catch',
    'tech', -- connpassは主にtech系
    (connpass_data->>'started_at')::TIMESTAMPTZ,
    (connpass_data->>'ended_at')::TIMESTAMPTZ,
    connpass_data->>'place',
    connpass_data->>'address',
    event_location,
    (connpass_data->>'limit')::INTEGER,
    (connpass_data->>'accepted')::INTEGER,
    connpass_data->>'event_url',
    (connpass_data->>'event_id')::TEXT,
    'connpass',
    connpass_data->>'owner_display_name'
  )
  ON CONFLICT (external_id, external_source) 
  DO UPDATE SET
    current_participants = EXCLUDED.current_participants,
    updated_at = NOW()
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;
```

### 4. 自動削除トリガー

```sql
-- 古い位置情報自動削除（7日後）
CREATE OR REPLACE FUNCTION delete_old_locations() RETURNS trigger AS $$
BEGIN
  DELETE FROM user_locations WHERE created_at < NOW() - INTERVAL '7 days';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_old_locations_trigger
  AFTER INSERT ON user_locations
  EXECUTE FUNCTION delete_old_locations();
```

---

## 🔐 セキュリティ設定 (RLS)

```sql
-- イベントテーブルのRLS有効化
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 読み取り: 全員可能（パブリックデータ）
CREATE POLICY "Events are publicly readable" ON events
  FOR SELECT USING (true);

-- 挿入: 認証済みユーザーのみ（将来実装）
CREATE POLICY "Authenticated users can insert events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 位置情報履歴のRLS
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- 自分のセッションのみアクセス可能
CREATE POLICY "Users can only access own location data" ON user_locations
  FOR ALL USING (
    session_id = current_setting('request.headers')::json->>'x-session-id'
  );

-- 検索ログのRLS
ALTER TABLE event_searches ENABLE ROW LEVEL SECURITY;

-- 自分のセッションのみアクセス可能
CREATE POLICY "Users can only access own search data" ON event_searches
  FOR ALL USING (
    session_id = current_setting('request.headers')::json->>'x-session-id'
  );
```

---

## 📊 サンプルデータ投入

```sql
-- テスト用イベントデータ
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
  ),
  (
    'テニス交流会 @代々木',
    '初心者歓迎！楽しくテニスしましょう',
    'sports',
    NOW() + INTERVAL '3 hours',
    NOW() + INTERVAL '5 hours',
    '代々木公園テニスコート',
    '東京都渋谷区代々木神園町2-1',
    ST_Point(139.6946, 35.6732)
  ),
  (
    'アート展示会 @六本木',
    '現代アート作品の展示とトークイベント',
    'art',
    NOW() + INTERVAL '4 hours',
    NOW() + INTERVAL '7 hours',
    '六本木ヒルズ森美術館',
    '東京都港区六本木6-10-1',
    ST_Point(139.7291, 35.6604)
  );

-- 動作確認クエリ
SELECT get_nearby_events(35.6762, 139.6503, 10);
```

---

## 📈 パフォーマンス最適化

### 1. 部分インデックス

```sql
-- アクティブなイベントのみ（効率的）
CREATE INDEX events_active_idx ON events (start_time, category)
WHERE start_time > NOW() AND is_online = FALSE;

-- 距離計算高速化（東京基準）
CREATE INDEX events_tokyo_distance_idx ON events (
  (ST_Distance(location, ST_Point(139.6917, 35.6895)::geography) / 1000.0)
) WHERE start_time > NOW();
```

### 2. 統計情報更新

```sql
-- 統計情報更新関数
CREATE OR REPLACE FUNCTION update_event_statistics()
RETURNS void AS $$
BEGIN
  -- 統計情報更新
  ANALYZE events;
  ANALYZE user_locations;
  ANALYZE event_searches;
  
  -- 古いデータ削除
  DELETE FROM event_searches WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- 外部データ再同期フラグ更新
  UPDATE events SET updated_at = NOW() 
  WHERE external_source IS NOT NULL 
    AND updated_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- 日次実行設定（Supabaseのcron extension使用）
SELECT cron.schedule('update-event-stats', '0 2 * * *', 'SELECT update_event_statistics();');
```

### 3. 分析用ビュー

```sql
-- イベント密度分析
CREATE VIEW event_density_stats AS
SELECT 
  category,
  COUNT(*) as total_events,
  AVG(ST_Distance(location, ST_Point(139.6917, 35.6895)::geography) / 1000.0) as avg_distance_from_tokyo_km,
  MIN(start_time) as earliest_event,
  MAX(start_time) as latest_event
FROM events
WHERE start_time > NOW()
GROUP BY category
ORDER BY total_events DESC;

-- 人気エリア分析（将来の機能用）
CREATE VIEW popular_areas AS
SELECT 
  ST_ClusterKMeans(location, 10) OVER() as cluster_id,
  COUNT(*) as event_count,
  ST_Centroid(ST_Collect(location)) as center_point,
  ARRAY_AGG(DISTINCT category) as categories
FROM events
WHERE start_time > NOW() - INTERVAL '30 days'
GROUP BY cluster_id
HAVING COUNT(*) >= 3
ORDER BY event_count DESC;
```

---

## 💻 Next.js統合

### 1. Supabaseクライアント設定

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2. データベース操作関数

```typescript
// src/lib/database.ts
import { supabase } from './supabase'
import { Event } from '@/types'

export async function getNearbyEvents(
  lat: number, 
  lng: number, 
  options: {
    radiusKm?: number;
    categories?: string[];
    maxHours?: number;
    limit?: number;
  } = {}
): Promise<Event[]> {
  const { data, error } = await supabase.rpc('get_nearby_events', {
    user_lat: lat,
    user_lng: lng,
    radius_km: options.radiusKm || 5,
    category_filter: options.categories || null,
    max_hours_ahead: options.maxHours || 24,
    limit_count: options.limit || 20
  });
  
  if (error) throw error;
  return data as Event[];
}

export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Event;
}

export async function saveUserLocation(
  sessionId: string,
  lat: number,
  lng: number,
  address?: string,
  accuracy?: number,
  source: 'gps' | 'manual' | 'ip' = 'gps'
) {
  const { error } = await supabase
    .from('user_locations')
    .insert({
      session_id: sessionId,
      location: `POINT(${lng} ${lat})`,
      address,
      accuracy,
      source
    });
  
  if (error) throw error;
}
```

### 3. リアルタイム更新

```typescript
// src/hooks/useRealtimeEvents.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Event } from '@/types'

export function useRealtimeEvents(initialEvents: Event[]) {
  const [events, setEvents] = useState<Event[]>(initialEvents)

  useEffect(() => {
    const subscription = supabase
      .channel('events_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          console.log('Event updated:', payload)
          // イベント一覧を再取得またはローカル更新
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return events
}
```

---

## 🧪 テスト・デバッグ

### 1. 動作確認クエリ

```sql
-- 基本機能テスト
SELECT get_nearby_events(35.6762, 139.6503, 5);

-- 距離計算確認
SELECT 
  title,
  ST_Distance(location, ST_Point(139.6503, 35.6762)::geography) / 1000.0 as distance_km
FROM events
ORDER BY distance_km;

-- インデックス使用確認
EXPLAIN ANALYZE
SELECT * FROM events 
WHERE ST_DWithin(location, ST_Point(139.6503, 35.6762)::geography, 5000);
```

### 2. パフォーマンステスト

```sql
-- 大量データでの性能テスト
INSERT INTO events (title, category, start_time, end_time, location_name, address, location)
SELECT 
  'Test Event ' || generate_series,
  'tech',
  NOW() + (generate_series || ' hours')::INTERVAL,
  NOW() + (generate_series + 2 || ' hours')::INTERVAL,
  'Test Venue ' || generate_series,
  'Test Address ' || generate_series,
  ST_Point(
    139.6503 + (random() - 0.5) * 0.1, -- 東京周辺ランダム
    35.6762 + (random() - 0.5) * 0.1
  )
FROM generate_series(1, 1000);

-- 性能測定
\timing
SELECT get_nearby_events(35.6762, 139.6503, 10);
\timing
```

---

## 🔄 バックアップ・復旧

### 1. データエクスポート

```bash
# Supabase CLI を使用
supabase db dump --file backup.sql

# または SQL でエクスポート
COPY events TO '/tmp/events_backup.csv' WITH CSV HEADER;
```

### 2. データ復旧

```sql
-- CSVからの復元
COPY events FROM '/tmp/events_backup.csv' WITH CSV HEADER;

-- 制約チェック
SELECT * FROM events WHERE location IS NULL;
SELECT * FROM events WHERE start_time > end_time;
```

---

## 📚 トラブルシューティング

### よくある問題

**1. PostGIS拡張エラー**
```sql
-- 再インストール
DROP EXTENSION IF EXISTS postgis CASCADE;
CREATE EXTENSION postgis;
```

**2. 地理座標エラー**
```sql
-- 座標順序確認（PostGISは longitude, latitude）
SELECT ST_Point(139.6503, 35.6762); -- 正しい
SELECT ST_Point(35.6762, 139.6503); -- 間違い
```

**3. パフォーマンス問題**
```sql
-- インデックス再構築
REINDEX INDEX events_location_idx;

-- 統計情報更新
ANALYZE events;
```

---

## 🔄 更新履歴

| 日付 | 変更内容 | 更新者 |
|------|----------|--------|
| 2025/6/18 | 初版作成（実装詳細） | Claude |

次回更新: 外部API連携実装時