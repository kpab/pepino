// 全般的な型定義

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startTime: Date;
  endTime: Date;
  location: Location;
  maxParticipants?: number;
  currentParticipants: number;
  participantIds: string[];
  organizerId: string;
  organizer: User;
  price?: number;
  currency: 'JPY' | 'USD' | 'EUR';
  tags: string[];
  imageUrl?: string;
  isOnline: false; // Pepinoはオフライン限定
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  prefecture: string;
  city: string;
  district?: string;
  landmarks?: string[];
  accessInfo?: AccessInfo;
}

export interface AccessInfo {
  nearestStation?: string;
  walkingTime?: number; // 分
  trainLine?: string;
  trainTime?: number; // 分
  busRoute?: string;
  busTime?: number; // 分
}

export type EventCategory = 
  | 'networking'
  | 'workshop'
  | 'seminar'
  | 'sports'
  | 'cultural'
  | 'food'
  | 'music'
  | 'art'
  | 'tech'
  | 'business'
  | 'hobby'
  | 'volunteer'
  | 'other';

export interface EventFilter {
  category?: EventCategory[];
  maxDistance?: number; // km
  maxPrice?: number;
  startTimeFrom?: Date;
  startTimeTo?: Date;
  availableSlots?: boolean; // 空きがあるイベントのみ
  tags?: string[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number; // メートル
  timestamp: Date;
  source: 'gps' | 'manual' | 'cached';
  address?: string;
}

export interface Participation {
  id: string;
  userId: string;
  eventId: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  joinedAt: Date;
  notes?: string;
}

// API関連の型
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// フォーム関連の型
export interface EventFormData {
  title: string;
  description: string;
  category: EventCategory;
  startTime: Date;
  endTime: Date;
  locationName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  maxParticipants?: number;
  price?: number;
  tags: string[];
  imageUrl?: string;
}

export interface LocationSearchResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string; // Google Places API
  distance?: number; // ユーザーからの距離（km）
}

// Zustand Store関連の型
export interface AppState {
  user: User | null;
  userLocation: UserLocation | null;
  events: Event[];
  filters: EventFilter;
  isLoading: boolean;
  error: string | null;
}

export interface AppActions {
  setUser: (user: User | null) => void;
  setUserLocation: (location: UserLocation) => void;
  setEvents: (events: Event[]) => void;
  updateFilters: (filters: Partial<EventFilter>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Google Maps関連の型
export interface MapConfig {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  apiKey: string;
}

export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  type: 'event' | 'user' | 'venue';
  data?: Event | User | Location;
}

// ユーティリティ型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// 外部API関連の型（connpass等）
export interface ExternalEventSource {
  id: string;
  name: string;
  apiUrl: string;
  isActive: boolean;
  lastSyncAt?: Date;
}

export interface ConnpassEvent {
  event_id: number;
  title: string;
  catch: string;
  description: string;
  event_url: string;
  started_at: string;
  ended_at: string;
  limit: number;
  accepted: number;
  waiting: number;
  updated_at: string;
  owner_id: number;
  owner_nickname: string;
  owner_display_name: string;
  place: string;
  address: string;
  lat: string;
  lon: string;
  series: {
    id: number;
    title: string;
    url: string;
  };
}
