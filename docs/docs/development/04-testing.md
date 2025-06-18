# テスト方針

このページでは、Pepinoプロジェクトのテスト戦略と実装方針を定義します。

## テスト戦略

### テストピラミッド

```
        /\
       /  \
      /E2E \     ← 少数（重要フロー）
     /______\
    /        \
   /Integration\ ← 中程度（API・コンポーネント間）
  /__________\
 /            \
/   Unit Tests  \  ← 多数（関数・コンポーネント）
/______________\
```

### テスト方針
1. **Unit Tests**: 70% - 個別関数・コンポーネント
2. **Integration Tests**: 20% - API・システム間連携
3. **E2E Tests**: 10% - 重要なユーザーフロー

## テストフレームワーク

### フロントエンド
- **Jest**: Unit Testing Framework
- **React Testing Library**: React コンポーネントテスト
- **MSW (Mock Service Worker)**: API モック
- **Playwright**: E2E テスト

### バックエンド
- **Jest**: API Unit Tests
- **Supertest**: HTTP アサーション
- **Supabase Test Client**: データベーステスト

## Unit Tests

### コンポーネントテスト

```typescript
// EventCard.test.tsx
import { render, screen } from '@testing-library/react'
import { EventCard } from './EventCard'

const mockEvent = {
  id: 'event_123',
  title: 'テストイベント',
  description: 'テスト用の説明',
  location: { lat: 35.6762, lng: 139.6503 },
  startTime: '2025-06-20T19:00:00Z'
}

describe('EventCard', () => {
  it('イベント情報を正しく表示する', () => {
    render(<EventCard event={mockEvent} />)
    
    expect(screen.getByText('テストイベント')).toBeInTheDocument()
    expect(screen.getByText('テスト用の説明')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '参加する' })).toBeInTheDocument()
  })

  it('参加ボタンクリック時にイベントが発火する', async () => {
    const mockOnJoin = jest.fn()
    render(<EventCard event={mockEvent} onJoin={mockOnJoin} />)
    
    const joinButton = screen.getByRole('button', { name: '参加する' })
    await userEvent.click(joinButton)
    
    expect(mockOnJoin).toHaveBeenCalledWith(mockEvent.id)
  })
})
```

### カスタムフックテスト

```typescript
// useEventData.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useEventData } from './useEventData'

describe('useEventData', () => {
  it('イベントデータを正しく取得する', async () => {
    const { result } = renderHook(() => useEventData('event_123'))
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBeDefined()
    })
  })
})
```

### ユーティリティ関数テスト

```typescript
// calculateDistance.test.ts
import { calculateDistance } from './calculateDistance'

describe('calculateDistance', () => {
  it('正しい距離を計算する', () => {
    const point1 = { lat: 35.6762, lng: 139.6503 } // 渋谷
    const point2 = { lat: 35.6581, lng: 139.7414 } // 新宿
    
    const distance = calculateDistance(point1, point2)
    
    expect(distance).toBeCloseTo(7.5, 1) // 約7.5km
  })
})
```

## Integration Tests

### API統合テスト

```typescript
// api/events.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '../pages/api/events'

describe('/api/events', () => {
  it('GET: 現在地周辺のイベントを返す', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        lat: '35.6762',
        lng: '139.6503',
        radius: '5'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(Array.isArray(data.events)).toBe(true)
  })
})
```

### データベース統合テスト

```typescript
// database/events.test.ts
import { supabase } from '@/lib/supabase'
import { EventService } from '@/services/EventService'

describe('EventService', () => {
  beforeEach(async () => {
    // テストデータベースのクリーンアップ
    await supabase.from('events').delete().neq('id', '')
  })

  it('イベントを正しく作成する', async () => {
    const eventData = {
      title: 'テストイベント',
      description: 'テスト用',
      location: { lat: 35.6762, lng: 139.6503 }
    }

    const result = await EventService.createEvent(eventData)

    expect(result.success).toBe(true)
    expect(result.data.id).toBeDefined()
  })
})
```

## E2E Tests

### 主要フローテスト

```typescript
// e2e/event-search.spec.ts
import { test, expect } from '@playwright/test'

test.describe('イベント検索フロー', () => {
  test('現在地設定からイベント検索まで', async ({ page }) => {
    await page.goto('/')
    
    // 位置情報許可（モック）
    await page.context().setGeolocation({ latitude: 35.6762, longitude: 139.6503 })
    await page.getByRole('button', { name: '位置情報を許可' }).click()
    
    // イベント一覧の表示確認
    await expect(page.getByTestId('event-list')).toBeVisible()
    await expect(page.getByTestId('event-card')).toHaveCount.greaterThan(0)
    
    // イベント詳細への遷移
    await page.getByTestId('event-card').first().click()
    await expect(page.getByTestId('event-detail')).toBeVisible()
    
    // 参加ボタンの動作確認
    await page.getByRole('button', { name: '参加する' }).click()
    await expect(page.getByText('参加しました')).toBeVisible()
  })
})
```

### エラーハンドリングテスト

```typescript
// e2e/error-handling.spec.ts
test('ネットワークエラー時の動作', async ({ page }) => {
  // ネットワークを無効化
  await page.context().setOffline(true)
  
  await page.goto('/')
  
  // オフライン表示の確認
  await expect(page.getByText('オフラインです')).toBeVisible()
  
  // キャッシュデータの表示確認
  await expect(page.getByTestId('cached-events')).toBeVisible()
})
```

## パフォーマンステスト

### Lighthouse CI

```json
// .lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.8}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

### Core Web Vitals テスト

```typescript
// tests/performance/web-vitals.test.ts
import { test, expect } from '@playwright/test'

test('Core Web Vitals 測定', async ({ page }) => {
  await page.goto('/')
  
  // LCP (Largest Contentful Paint)
  const lcp = await page.evaluate(() => 
    new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        resolve(lastEntry.startTime)
      }).observe({ entryTypes: ['largest-contentful-paint'] })
    })
  )
  
  expect(lcp).toBeLessThan(2500) // 2.5秒以内
})
```

## テストデータ管理

### ファクトリーパターン

```typescript
// tests/factories/EventFactory.ts
export class EventFactory {
  static create(overrides: Partial<EventType> = {}): EventType {
    return {
      id: `event_${Math.random().toString(36).substr(2, 9)}`,
      title: 'テストイベント',
      description: 'テスト用の説明文',
      location: { lat: 35.6762, lng: 139.6503 },
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
      category: 'tech',
      price: 0,
      capacity: 50,
      organizer: UserFactory.create(),
      ...overrides
    }
  }

  static createMany(count: number, overrides: Partial<EventType> = {}): EventType[] {
    return Array.from({ length: count }, () => this.create(overrides))
  }
}
```

### モックデータ

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw'
import { EventFactory } from '../factories/EventFactory'

export const handlers = [
  rest.get('/api/events', (req, res, ctx) => {
    const lat = req.url.searchParams.get('lat')
    const lng = req.url.searchParams.get('lng')
    
    if (!lat || !lng) {
      return res(ctx.status(400), ctx.json({ error: 'Missing coordinates' }))
    }
    
    const events = EventFactory.createMany(5)
    return res(ctx.json({ events }))
  }),

  rest.post('/api/events', (req, res, ctx) => {
    const event = EventFactory.create()
    return res(ctx.status(201), ctx.json({ event }))
  })
]
```

## CI/CD統合

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

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
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
      
    - name: Run E2E tests
      run: npm run test:e2e
      
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

## テスト実行コマンド

```json
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:performance": "lighthouse-ci"
  }
}
```

## カバレッジ目標

### 目標値
- **Unit Tests**: 90%以上
- **Integration Tests**: 80%以上
- **E2E Critical Paths**: 100%

### 除外対象
- サードパーティライブラリラッパー
- 設定ファイル
- 型定義ファイル

## ベストプラクティス

### テスト命名規則
```typescript
describe('ComponentName', () => {
  describe('when prop X is provided', () => {
    it('should render Y', () => {
      // テスト内容
    })
  })

  describe('when user clicks button', () => {
    it('should call handler function', () => {
      // テスト内容
    })
  })
})
```

### テスト分離
- 各テストは独立して実行可能
- 共有状態の使用を避ける
- beforeEach/afterEachでクリーンアップ

### アサーション品質
- 具体的で分かりやすいエラーメッセージ
- エッジケースも含めてテスト
- False Positive/Negativeを避ける

[TODO: テスト自動化の更なる改善]
