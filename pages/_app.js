
import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>TrendPulse - Discover What's Trending Across The Internet</title>
        <meta name="description" content="Real-time trending data from Google, YouTube, Twitter, Reddit, Wikipedia, Spotify, and Netflix" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
