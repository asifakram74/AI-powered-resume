import type { AppProps } from "next/app";
import "../app/globals.css";
import { ReduxProvider } from "../lib/redux/provider";
import { Toaster } from "sonner";
import HydrateAuth from "../components/auth/HydrateAuth";
import Head from "next/head";
import { ThemeProvider } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="googlebot" content="noindex,nofollow" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "v0az88rsoo");
            `,
          }}
        />
      </Head>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <ReduxProvider>
          <HydrateAuth />
          <Toaster position="top-right" richColors />
          <ThemeToggle />
          <Component {...pageProps} />
        </ReduxProvider>
      </ThemeProvider>
    </>
  );
}
