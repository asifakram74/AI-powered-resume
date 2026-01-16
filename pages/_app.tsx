import type { AppProps } from "next/app";
import "../app/globals.css";
import { ReduxProvider } from "../lib/redux/provider";
import { Toaster } from "sonner";
import HydrateAuth from "../components/auth/HydrateAuth";
import Head from "next/head";
import { ThemeProvider } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";
import { Inter, Rubik, Roboto, Open_Sans, Lato } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const rubik = Rubik({ subsets: ['latin'], variable: '--font-rubik' });
const roboto = Roboto({ weight: ['100', '300', '400', '500', '700', '900'], subsets: ['latin'], variable: '--font-roboto' });
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' });
const lato = Lato({ weight: ['100', '300', '400', '700', '900'], subsets: ['latin'], variable: '--font-lato' });

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
                c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "tgtlmcxmje");
            `,
          }}
        />
      </Head>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <ReduxProvider>
          <HydrateAuth />
          <Toaster position="top-right" richColors />
          <ThemeToggle />
          <main className={`${inter.variable} ${rubik.variable} ${roboto.variable} ${openSans.variable} ${lato.variable} font-sans`}>
            <Component {...pageProps} />
          </main>
        </ReduxProvider>
      </ThemeProvider>
    </>
  );
}
