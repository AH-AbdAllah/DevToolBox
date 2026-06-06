import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PremiumBanner } from "@/components/marketing/premium-banner";
import { HomePageClient } from "@/components/marketing/home-page-client";

export const metadata: Metadata = {
  title: "DevToolBox - Essential Online Developer & Student Tools",
  description:
    "A clean, security-first collection of essential client-side utilities including a JSON formatter, Base64 encoder/decoder, and secure password generator. No data leaves your browser.",
  keywords: [
    "developer tools",
    "student utilities",
    "JSON formatter",
    "JSON validator",
    "Base64 encoder",
    "Base64 decoder",
    "password generator",
    "offline tools",
    "hash generator",
    "formatters",
  ],
  openGraph: {
    title: "DevToolBox - Free Online Developer Tools",
    description:
      "Format, validate, encode, decode, and generate passwords in real-time. Designed to be fast, client-side secure, and completely ad-light.",
    type: "website",
    locale: "en_US",
    siteName: "DevToolBox",
  },
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  // Structured Data (JSON-LD) for SoftwareApplication
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "DevToolBox",
    "url": "https://devtoolbox.com",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Free web-based developer and student utility toolbox. Safe offline formatters, encoders, and secure password generators.",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-grow">
        <HomePageClient />
      </main>
      <PremiumBanner />
      <Footer />
    </>
  );
}
