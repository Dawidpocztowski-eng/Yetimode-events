import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'YetiMode Events — Platforma wydarzeń online',
  description: 'Stwórz profesjonalną stronę swojego wesela, urodzin lub chrzcin w kilka minut.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'YetiMode Events' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0a0a0f" />
      </head>
      <body className="bg-[#0a0a0f] text-white min-h-screen antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
          }}
        />
      </body>
    </html>
  )
}
