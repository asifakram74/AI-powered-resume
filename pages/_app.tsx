import type { AppProps } from "next/app";
import "../app/globals.css";
import { ReduxProvider } from "@/lib/redux/provider";
import { Toaster } from "sonner";
import HydrateAuth from "@/components/auth/HydrateAuth";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ReduxProvider>
      <HydrateAuth />
      <Toaster position="top-right" richColors />
      <Component {...pageProps} />
    </ReduxProvider>
  );
}

