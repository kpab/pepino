'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  useEffect(() => {
    setMounted(true);
    // 位置情報の許可状況を確認
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as 'prompt' | 'granted' | 'denied');
      });
    }
  }, []);

  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('位置情報取得成功:', position.coords);
          setLocationPermission('granted');
        },
        (error) => {
          console.error('位置情報取得エラー:', error);
          setLocationPermission('denied');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5分
        }
      );
    }
  };

  if (!mounted) {
    return null; // SSRを避けるためのマウント確認
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50'>
      {/* ヘッダー */}
      <header className='bg-white/80 backdrop-blur-md border-b border-white/20'>
        <div className='max-w-md mx-auto px-4 py-3'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold text-primary-600'>🍑 Pepino</h1>
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-gray-600'>MVP v0.1.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className='max-w-md mx-auto px-4 py-8'>
        {/* ウェルカムセクション */}
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>
            今すぐ参加できる
            <br />
            <span className='text-primary-600'>オフラインイベント</span>
            <br />
            を発見しよう
          </h2>
          <p className='text-gray-600 text-lg'>
            現在地周辺で開催中・開催予定のイベントを見つけて、新しい出会いを体験しませんか？
          </p>
        </div>

        {/* 位置情報セクション */}
        <div className='card mb-6'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-8 h-8 text-primary-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
              </svg>
            </div>
            
            {locationPermission === 'prompt' && (
              <>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  位置情報を使用して始める
                </h3>
                <p className='text-gray-600 mb-4 text-sm'>
                  あなたの周辺のイベントを表示するために、位置情報の使用を許可してください。
                </p>
                <button
                  onClick={requestLocationPermission}
                  className='btn-primary w-full'
                >
                  位置情報を許可する
                </button>
              </>
            )}
            
            {locationPermission === 'granted' && (
              <>
                <h3 className='text-lg font-semibold text-green-600 mb-2'>
                  ✅ 位置情報が有効です
                </h3>
                <p className='text-gray-600 mb-4 text-sm'>
                  お疲れ様です！周辺のイベントを検索できます。
                </p>
                <div className='location-indicator'>
                  📍 位置情報取得済み
                </div>
              </>
            )}
            
            {locationPermission === 'denied' && (
              <>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  手動で位置を設定
                </h3>
                <p className='text-gray-600 mb-4 text-sm'>
                  位置情報が使用できません。駅名や地域名を入力してください。
                </p>
                <input
                  type='text'
                  placeholder='例: 渋谷駅、新宿区など'
                  className='input mb-3'
                />
                <button className='btn-primary w-full'>
                  この場所で検索する
                </button>
              </>
            )}
          </div>
        </div>

        {/* 機能紹介カード */}
        <div className='space-y-4 mb-8'>
          <div className='card'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <div>
                <h4 className='font-semibold text-gray-900'>即時参加</h4>
                <p className='text-sm text-gray-600'>今から2時間後まで参加可能</p>
              </div>
            </div>
          </div>
          
          <div className='card'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                <svg className='w-5 h-5 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
              </div>
              <div>
                <h4 className='font-semibold text-gray-900'>オフライン限定</h4>
                <p className='text-sm text-gray-600'>リアルな出会いと体験</p>
              </div>
            </div>
          </div>
          
          <div className='card'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                <svg className='w-5 h-5 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3' />
                </svg>
              </div>
              <div>
                <h4 className='font-semibold text-gray-900'>近場で開催</h4>
                <p className='text-sm text-gray-600'>徒歩・電車でアクセス可能</p>
              </div>
            </div>
          </div>
        </div>

        {/* 開発状況 */}
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <div className='flex items-center space-x-2 mb-2'>
            <svg className='w-5 h-5 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <h4 className='font-semibold text-yellow-800'>開発中のお知らせ</h4>
          </div>
          <p className='text-sm text-yellow-700'>
            現在MVP（最小限の機能）を開発中です。Next.js環境の構築が完了しました！
            <br />
            <span className='font-medium'>次のステップ：</span> イベント一覧・地図表示機能の実装
          </p>
        </div>
      </div>
    </div>
  );
}
