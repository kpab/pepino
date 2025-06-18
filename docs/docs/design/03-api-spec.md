# API仕様

このページでは、Pepino APIの仕様を定義します。

## 概要

Pepino APIは RESTful API として設計され、位置情報ベースのイベント検索・管理機能を提供します。

## ベースURL

```
Production: https://api.pepino.app
Development: http://localhost:3000/api
```

## 認証

[TODO: 認証方式の詳細を記述]

## エンドポイント

### イベント関連

#### GET /api/events
現在地周辺のイベントを取得

**パラメータ:**
- `lat` (required): 緯度
- `lng` (required): 経度  
- `radius` (optional): 検索範囲（km、デフォルト: 5）
- `category` (optional): イベントカテゴリ

**レスポンス例:**
```json
{
  "events": [
    {
      "id": "event_123",
      "title": "技術勉強会",
      "description": "...",
      "location": {
        "lat": 35.6762,
        "lng": 139.6503,
        "address": "東京都渋谷区..."
      },
      "startTime": "2025-06-20T19:00:00Z",
      "endTime": "2025-06-20T21:00:00Z"
    }
  ]
}
```

#### POST /api/events
新しいイベントを作成

[TODO: 詳細なAPI仕様を記述]

### ユーザー関連

[TODO: ユーザー関連APIの詳細を記述]

## エラーハンドリング

[TODO: エラーレスポンスの詳細を記述]
