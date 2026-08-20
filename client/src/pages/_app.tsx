import type { AppProps } from 'next/app'
import { Cairo } from 'next/font/google'
import '@/pages/_app.css'
import { AuthProvider } from '@/context/AuthContext'
import { CallProvider } from '@/context/CallContext'
import { IncomingCallModal } from '@/components/call/IncomingCallModal'
import { ActiveCallModal } from '@/components/call/ActiveCallModal'
import ErrorBoundary from '@/components/ErrorBoundary'

// Arabic-first UI font: variable weight (200–1000) covers font-black/900 used across the app
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${cairo.variable} font-sans min-h-screen bg-background text-foreground`}>
      <ErrorBoundary>
        <AuthProvider>
          <CallProvider>
            <Component {...pageProps} />
            <IncomingCallModal />
            <ActiveCallModal />
          </CallProvider>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  )
}
