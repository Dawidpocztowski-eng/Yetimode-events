import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'YetiMode Events — Planuj. Twórz. Zapraszaj. Świętuj.',
  description: 'Profesjonalna platforma do tworzenia stron weselnych, urodzinowych i chrzcin. RSVP, galeria, foto budka i planer w jednym miejscu.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'YetiMode Events' },
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#101828" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#0B0F19] text-white min-h-screen antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#101828',
              color: '#fff',
              border: '1px solid rgba(20,110,245,0.3)',
              borderRadius: '12px',
              fontFamily: 'Poppins, sans-serif',
            },
          }}
        />
      </body>
    </html>
  )
}
