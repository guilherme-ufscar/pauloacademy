import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Academy Pop – Educação EAD de Qualidade',
  description: 'Cursos EJA, Pós-Graduação em Compliance e muito mais. 100% online, certificado reconhecido.',
  keywords: 'EJA, Compliance, Pós-Graduação, Cursos EAD, educação online',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '10px', background: '#1e3a8a', color: '#fff' },
            success: { style: { background: '#15803d' } },
            error: { style: { background: '#dc2626' } },
          }}
        />
      </body>
    </html>
  )
}
