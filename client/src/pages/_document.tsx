import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>
      <body className="antialiased bg-background text-foreground font-sans selection:bg-primary/10">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
