import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Text Summarizer',
  description: 'AI-powered text summarization tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
