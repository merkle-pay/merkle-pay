import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <Html lang="en">
      <Head>
        {turnstileSiteKey && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.mpGlobal = {
                  turnstileSiteKey: "${turnstileSiteKey}",
                };
              `,
            }}
          />
        )}
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
