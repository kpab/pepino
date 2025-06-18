import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pepino - 今すぐ参加できるオフラインイベント',
  description: '現在地周辺のオフラインイベントを「今すぐ」発見・参加できるWebアプリ',
  keywords: ['イベント', 'オフライン', '位置情報', '参加', '出会い', '今すぐ'],
  authors: [{ name: 'kpab' }],
  creator: 'kpab',
  publisher: 'Pepino',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // PWA対応のメタデータ
  manifest: '/manifest.json',
  themeColor: '#ef4444',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  // OGP設定
  openGraph: {
    type: 'website',
    siteName: 'Pepino',
    title: 'Pepino - 今すぐ参加できるオフラインイベント',
    description: '現在地周辺のオフラインイベントを「今すぐ」発見・参加できるWebアプリ',
    // url: 'https://pepino.app', // 本番環境のURL
    // images: [
    //   {
    //     url: '/og-image.png',
    //     width: 1200,
    //     height: 630,
    //     alt: 'Pepino App',
    //   },
    // ],
  },
  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'Pepino - 今すぐ参加できるオフラインイベント',
    description: '現在地周辺のオフラインイベントを「今すぐ」発見・参加できるWebアプリ',
    creator: '@pepino_app', // 実際のTwitterアカウント
    // images: ['/og-image.png'],
  },
  // その他のメタデータ
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ja' className='h-full'>
      <head>
        {/* 位置情報を使用するためのPermissions Policy */}
        <meta
          httpEquiv='Permissions-Policy'
          content='geolocation=*, camera=(), microphone=()'
        />
        {/* Apple関連のメタタグ */}
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='Pepino' />
        {/* Microsoft関連のメタタグ */}
        <meta name='msapplication-TileColor' content='#ef4444' />
        <meta name='msapplication-config' content='/browserconfig.xml' />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <div id='root' className='min-h-full'>
          {/* メインコンテンツ */}
          <main className='relative'>{children}</main>
          
          {/* モーダルやトーストなどのポータル用 */}
          <div id='modal-root' />
          <div id='toast-root' />
        </div>
        
        {/* 開発環境でのデバッグ情報 */}
        {process.env.NODE_ENV === 'development' && (
          <div className='fixed bottom-4 left-4 z-50 rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur'>
            <span className='sm:hidden'>XS</span>
            <span className='hidden sm:inline md:hidden'>SM</span>
            <span className='hidden md:inline lg:hidden'>MD</span>
            <span className='hidden lg:inline xl:hidden'>LG</span>
            <span className='hidden xl:inline 2xl:hidden'>XL</span>
            <span className='hidden 2xl:inline'>2XL</span>
          </div>
        )}
      </body>
    </html>
  );
}
