import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { JwtDecoderClient } from "./jwt-decoder-client";

export const metadata: Metadata = {
  title: "Online JWT Decoder - Decode JSON Web Tokens Privately",
  description:
    "Free client-side JWT Decoder to inspect JSON Web Token header, payload claims, and signature validity locally. Safe, private, offline-first.",
  keywords: [
    "JWT decoder",
    "decode JWT",
    "JSON Web Token inspector",
    "JWT payload viewer",
    "client-side JWT",
    "JWT parse",
    "JWT claims",
  ],
  openGraph: {
    title: "Online JWT Decoder - DevToolBox",
    description:
      "Inspect JSON Web Token headers, payloads, and timestamps locally in your browser. 100% private.",
    type: "website",
    url: "https://devtoolbox.com/tools/jwt-decoder",
  },
  alternates: {
    canonical: "/tools/jwt-decoder",
  },
};

export default function JwtDecoderPage() {
  const instructions = {
    title: "JWT Decoder",
    steps: [
      "Paste your encoded JSON Web Token (JWT) into the Input editor.",
      "The token is automatically divided into Header (red), Payload (blue), and Signature (green).",
      "Inspect the decoded JSON trees containing claims and metadata.",
      "Hover over or read the standard claims sections (Issuer `iss`, Subject `sub`, Expiration `exp` with human dates).",
      "All decoding is done client-side. Your token is never sent to any server.",
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Online JWT Decoder",
    "url": "https://devtoolbox.com/tools/jwt-decoder",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Free offline tool to decode and inspect JSON Web Token header parameters and payload claims safely.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="JWT Decoder"
          description="Decode and inspect JSON Web Tokens (JWT) payload claims, header algorithms, and signature layouts. Completely client-side."
          category="developers"
        />

        <ToolWrapper
          currentToolId="jwt-decoder"
          currentCategory="developers"
          instructions={instructions}
        >
          <JwtDecoderClient />
        </ToolWrapper>
      </div>
    </>
  );
}
