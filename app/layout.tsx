import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DandoriFinder - 住宅プラン検索システム',
  description: 'DandoriFinder - 過去の住宅プランを簡単に検索・閲覧できるシステム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
