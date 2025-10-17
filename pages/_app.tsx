import type { AppProps } from "next/app";
import "../app/globals.css";
import { ReduxProvider } from "../lib/redux/provider";
import { Toaster } from "sonner";
import HydrateAuth from "../components/auth/HydrateAuth";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="googlebot" content="noindex,nofollow" />
      </Head>
      <ReduxProvider>
        <HydrateAuth />
        <Toaster position="top-right" richColors />
        <Component {...pageProps} />
      </ReduxProvider>
    </>
  );
}
