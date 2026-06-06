import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { Analytics } from "@/components/analytics";
import { SplashScreen } from "@/components/layout/splash-screen";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devtoolbox.com"),
  title: {
    default: "DevToolBox — Developer Intelligence Command Center",
    template: "%s | DevToolBox",
  },
  description:
    "A high-precision, client-side developer intelligence platform. Sandbox detection, AI diagnostics, cryptographic utilities, and operational tooling. Zero server trace logging.",
  keywords: [
    "developer tools",
    "command center",
    "intelligence platform",
    "JSON formatter",
    "Base64 encoder",
    "password generator",
    "JWT decoder",
    "AI debugger",
    "subnet calculator",
    "developer sandbox",
  ],
  openGraph: {
    title: "DevToolBox — Developer Intelligence Command Center",
    description:
      "Operational developer tooling. Paste anything — the platform understands it. Client-side secure, zero trace logging.",
    type: "website",
    locale: "en_US",
    siteName: "DevToolBox",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <SplashScreen />
        {children}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
