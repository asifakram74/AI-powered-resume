import type React from "react";
import type { Metadata } from "next";
import "../styles/globals.css";
import "./globals.css";
import { ReduxProvider } from "../lib/redux/provider";
import { Toaster } from "sonner";
import HydrateAuth from "../components/auth/HydrateAuth";
import { ThemeProvider } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";
import Script from "next/script";
import { Inter, Rubik, Roboto, Open_Sans, Lato } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const rubik = Rubik({ subsets: ['latin'], variable: '--font-rubik' });
const roboto = Roboto({ weight: ['100', '300', '400', '500', '700', '900'], subsets: ['latin'], variable: '--font-roboto' });
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' });
const lato = Lato({ weight: ['100', '300', '400', '700', '900'], subsets: ['latin'], variable: '--font-lato' });

export const metadata: Metadata = {
 title: "Resumaic – AI-Powered Resume Builder Online",
  description: "Build professional resumes in minutes with Resumaic, the AI-powered resume builder. Create tailored CVs that stand out and boost your career success.",

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

  openGraph: {
    title: "Resumaic – AI-Powered Resume Builder Online",
    description:
      "Create beautiful, job-ready resumes instantly with AI. Resumaic helps you design, optimize, and export professional CVs that get noticed.",
    url: "https://app.resumaic.com",
    siteName: "Resumaic",
    images: [
      {
        url: "https://app.resumaic.com/resumic.png",
        width: 1200,
        height: 630,
        alt: "Resumaic App Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Resumaic – AI-Powered Resume Builder Online",
    description:
      "Design your perfect resume with AI assistance. Resumaic helps you stand out and land your dream job faster.",
    images: ["https://app.resumaic.com/resumic.png"],
    creator: "@resumaic",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} ${rubik.variable} ${roboto.variable} ${openSans.variable} ${lato.variable}`}>
        {/* Tawk.to */}
        <Script id="tawk" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/6964eeec46ee65197d4f8c96/1jep4ajkp';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
        <Script id="clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "v0az88rsoo");
          `}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <ReduxProvider>
            <HydrateAuth />
            <Toaster position="top-right" richColors />
            <ThemeToggle />
            {children}
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
