import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '../lib/utils'
import './global.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JobLess - Job Application Tracker',
  description: 'Track and manage your job applications efficiently with AI-powered insights',
  keywords: ['job tracker', 'application tracker', 'career management', 'job search'],
  authors: [{ name: 'JobLess Team' }],
  creator: 'JobLess',
  publisher: 'JobLess',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://jobless.app'),
  openGraph: {
    title: 'JobLess - Job Application Tracker',
    description: 'Track and manage your job applications efficiently with AI-powered insights',
    url: 'https://jobless.app',
    siteName: 'JobLess',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'JobLess - Job Application Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobLess - Job Application Tracker',
    description: 'Track and manage your job applications efficiently with AI-powered insights',
    images: ['/og-image.jpg'],
    creator: '@jobless_app',
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={cn(
        inter.className,
        "min-h-screen bg-black antialiased overflow-x-hidden"
      )}>
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}