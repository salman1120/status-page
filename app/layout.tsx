import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import './globals.css'
import { Toaster } from "sonner"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Status Page',
  description: 'Monitor your service status in real-time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
