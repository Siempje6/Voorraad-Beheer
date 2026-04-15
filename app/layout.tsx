import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

const dmSans = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Voorraadbeheer',
  description: 'Intern voorraad systeen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={dmSans.className}>
        <div className="flex h-screen bg-[#f4f4f0] overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-5">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}