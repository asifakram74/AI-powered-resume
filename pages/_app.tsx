import type { AppProps } from "next/app";
import "../app/globals.css";
import { ReduxProvider } from "../lib/redux/provider";
import { Toaster } from "sonner";
import HydrateAuth from "../components/auth/HydrateAuth";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ReduxProvider>
      <Head>
        {/* Favicon as your custom image */}
        <link rel="icon" type="image/png" href="/Resumic.png" />
      </Head>
      <HydrateAuth />
      <Toaster position="top-right" richColors />
      <Component {...pageProps} />
    </ReduxProvider>
  );
}
