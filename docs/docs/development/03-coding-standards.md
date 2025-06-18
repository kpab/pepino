# コーディング規約

このページでは、Pepinoプロジェクトのコーディング規約を定義します。

## 概要

一貫性のあるコードベースを維持し、チーム開発を効率化するための規約です。

## 言語別規約

### TypeScript/JavaScript

#### 基本ルール
- **TypeScript必須**: `any`型の使用禁止
- **strict mode**: tsconfig.jsonで厳密な型チェック有効
- **ESLint + Prettier**: 自動フォーマットとリント
- **ES6+**: モダンJavaScript構文を使用

#### 命名規則
```typescript
// PascalCase: コンポーネント、型、インターフェース
interface UserProfile {}
type EventData = {}
const EventCard = () => {}

// camelCase: 変数、関数、メソッド
const userName = 'John'
const calculateDistance = () => {}
const useEventData = () => {}

// UPPER_SNAKE_CASE: 定数
const API_BASE_URL = 'https://api.pepino.app'
const MAX_SEARCH_RADIUS = 50
```

#### ファイル命名規則
```
# kebab-case: ファイル名（基本）
event-card.tsx
user-profile.tsx
search-filter.tsx

# PascalCase: コンポーネントファイル（例外）
EventCard/index.tsx
UserProfile/UserProfile.tsx

# camelCase: ユーティリティ・フック
useEventData.ts
calculateDistance.ts
```

#### インポート順序
```typescript
// 1. Node modules
import React from 'react'
import { NextPage } from 'next'

// 2. 内部ライブラリ
import { supabase } from '@/lib/supabase'
import { EventType } from '@/types'

// 3. 相対インポート
import './EventCard.module.css'
import { EventCard } from '../EventCard'
```

### React/Next.js

#### コンポーネント定義
```typescript
// Function Components（推奨）
interface Props {
  title: string
  description?: string
}

export const EventCard: React.FC<Props> = ({ title, description }) => {
  return (
    <div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}

// Default export（ページコンポーネントのみ）
export default EventCard
```

#### Hooks使用規則
```typescript
// カスタムフック: use- プレフィックス
export const useEventData = (eventId: string) => {
  const [data, setData] = useState<EventType | null>(null)
  // ...
  return { data, loading, error }
}

// Built-in hooks: 適切な依存配列
useEffect(() => {
  fetchEvents()
}, [location, filters]) // 依存関係を明確に
```

### CSS/Styling

#### Tailwind CSS規約
```typescript
// クラス順序: レイアウト → 視覚 → インタラクション
className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"

// 長いクラス: 複数行に分割
className={`
  flex flex-col items-start gap-2
  p-6 m-4
  bg-white border border-gray-200 rounded-xl
  shadow-sm hover:shadow-md
  transition-all duration-200
`}
```

#### CSS Variables（カスタムプロパティ）
```css
:root {
  /* カラー */
  --color-primary: #ff6b35;
  --color-secondary: #2e8b57;
  
  /* スペーシング */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  
  /* ブレークポイント */
  --breakpoint-mobile: 640px;
  --breakpoint-tablet: 1024px;
}
```

## プロジェクト構造規約

### ディレクトリ構造
```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # ルートグループ
│   ├── api/               # API Routes
│   └── globals.css        # グローバルスタイル
├── components/
│   ├── ui/                # 汎用UIコンポーネント
│   ├── features/          # 機能別コンポーネント
│   └── layouts/           # レイアウトコンポーネント
├── hooks/                 # カスタムフック
├── lib/                   # ユーティリティ・設定
├── stores/                # Zustand状態管理
├── types/                 # TypeScript型定義
└── styles/                # スタイル定義
```

### コンポーネント構成
```
components/features/event-card/
├── index.ts               # エクスポート
├── EventCard.tsx         # メインコンポーネント
├── EventCard.test.tsx    # テストファイル
├── EventCard.stories.tsx # Storybookファイル
└── EventCard.module.css  # スタイル（必要時）
```

## Git規約

### コミットメッセージ
```bash
# フォーマット: type(scope): description
feat(events): add event search filter functionality
fix(map): resolve location accuracy issue
docs(setup): update installation instructions
style(ui): improve button hover animations
refactor(api): optimize event query performance
test(events): add unit tests for event service
chore(deps): update dependencies to latest versions
```

### ブランチ名
```bash
# フォーマット: type/description-with-hyphens
feature/event-search-filter
bugfix/map-location-accuracy
hotfix/critical-api-error
docs/update-setup-guide
refactor/optimize-event-queries
```

## エラーハンドリング

### Try-Catch使用例
```typescript
// API呼び出し
export const fetchEvents = async (params: SearchParams): Promise<EventType[]> => {
  try {
    const response = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
    
    if (response.error) throw response.error
    return response.data || []
  } catch (error) {
    console.error('Failed to fetch events:', error)
    throw new Error('イベントの取得に失敗しました')
  }
}
```

### エラー境界
```typescript
// React Error Boundary
class EventErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Event component error:', error, errorInfo)
    // エラー報告サービスに送信
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

## パフォーマンス規約

### 画像最適化
```typescript
// Next.js Image コンポーネント使用
import Image from 'next/image'

<Image
  src="/event-image.jpg"
  alt="イベント画像"
  width={300}
  height={200}
  loading="lazy"
  placeholder="blur"
/>
```

### 状態管理最適化
```typescript
// Zustand: 必要な部分のみ購読
const eventTitle = useEventStore((state) => state.currentEvent?.title)
const updateEvent = useEventStore((state) => state.updateEvent)

// React.memo: 不要な再レンダリング防止
export const EventCard = React.memo<Props>(({ event }) => {
  // ...
})
```

## セキュリティ規約

### 環境変数
```typescript
// .env.local（Gitにコミットしない）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

// 使用時は型安全に
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('Google Maps API key is required')
}
```

### 入力検証
```typescript
// Zod スキーマ定義
const EventSchema = z.object({
  title: z.string().min(1, '名前は必須です').max(100, '100文字以内で入力してください'),
  description: z.string().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  })
})

// 使用例
try {
  const validatedData = EventSchema.parse(formData)
  // 処理続行
} catch (error) {
  // バリデーションエラー処理
}
```

## コードレビュー指針

### チェック項目
1. **型安全性**: TypeScript エラーなし
2. **パフォーマンス**: 不要な再レンダリング・API呼び出しなし
3. **セキュリティ**: 入力検証・XSS対策
4. **アクセシビリティ**: ARIA属性・キーボード操作
5. **テスト**: 新機能にテストケース追加

### 自動化ツール
- **ESLint**: 静的解析・ルール強制
- **Prettier**: コードフォーマット
- **TypeScript**: 型チェック
- **Husky**: コミット前フック
- **lint-staged**: ステージングファイルのみリント

## 設定ファイル

### .eslintrc.json
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### .prettierrc.json
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

[TODO: プロジェクト進行に合わせて規約を更新・追加]
