import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "@/index.css";
import "@/styles/fonts.css";

export function Layout({ children }: { children: ReactNode }) {
  return <html lang="ko"><head>
    <meta charSet="utf-8" />
    <link rel="icon" href="/favicon.ico" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#279023" />

    <link rel="shortcut icon" href="/icon.png" />
    <link rel="apple-touch-icon" href="/icon.png" />

    <title>이디저디</title>
    <meta name="description" content="제주과학고 학교생활 사이트입니다." />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="이디저디" />
    <meta
      property="og:description"
      content="제주과학고 학교생활 사이트입니다."
    />
    <meta property="og:image" content="/og_image.png" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:locale" content="ko_KR" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta property="twitter:domain" content="https://new.이디저디.com" />
    <meta property="twitter:title" content="이디저디" />
    <meta
      property="twitter:description"
      content="제주과학고 학교생활 사이트입니다."
    />
    <meta property="twitter:image" content="/og_image.png" />
    <meta property="twitter:image:type" content="image/png" />

    <meta
      name="google-site-verification"
      content="cl2Yxg1GspLfQmmavZWDhyDJFfoIrTVo-u4yhtRxUa4"
    />
      <Meta /><Links />
  </head><body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">{children}</div>
    <ScrollRestoration /><Scripts />
  </body></html>;
}

export function HydrateFallback() { return null; }
export default function Root() { return <Outlet />; }
