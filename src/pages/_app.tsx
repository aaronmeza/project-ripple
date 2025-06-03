
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Header from '@/components/Header';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <main className="pt-16"> {/* 64 px header height */}
        <Component {...pageProps} />
      </main>
    </>
  );
}
