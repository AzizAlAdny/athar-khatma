import type { AppProps } from 'next/app'
import { Cairo } from 'next/font/google'
import '@/pages/_app.css'
import { AuthProvider } from '@/context/AuthContext'
import ErrorBoundary from '@/components/ErrorBoundary'

// Arabic-first UI font: variable weight (200–1000) covers font-black/900 used across the app
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${cairo.variable} font-sans`}>
      <ErrorBoundary>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ErrorBoundary>
    </div>
  )
}
