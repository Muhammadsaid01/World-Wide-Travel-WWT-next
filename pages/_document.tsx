import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="robots" content="index,follow" />

        <link rel="icon" href="/favicon.ico" />

        {/* SEO */}
        <meta
          name="keywords"
          content="WWT, Wonder World Travel, travel, travel packages, tours, travel agents, Korea travel, world travel"
        />

        <meta
          name="description"
          content="WWT — Wonder World Travel. Discover travel packages, connect with trusted travel agents, find travel mates, and plan your next journey around the world."
        />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}