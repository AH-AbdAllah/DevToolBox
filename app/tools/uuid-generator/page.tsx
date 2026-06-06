import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { UuidGeneratorClient } from "./uuid-generator-client";

export const metadata: Metadata = {
  title: "Online UUID / GUID Generator - Bulk Random UUIDs",
  description:
    "Free client-side tool to bulk generate random RFC 4122 compliant UUID v4 and v1 strings instantly. Select quantities, custom casing, and formats.",
  keywords: [
    "UUID generator",
    "GUID generator",
    "random UUID",
    "bulk UUID generator",
    "UUID v4",
    "UUID v1",
    "RFC 4122",
    "GUID code",
  ],
  openGraph: {
    title: "Online UUID / GUID Generator - DevToolBox",
    description:
      "Bulk generate random time-based or namespace UUID v4/v1 strings locally in your browser. Configurable formats.",
    type: "website",
    url: "https://devtoolbox.com/tools/uuid-generator",
  },
  alternates: {
    canonical: "/tools/uuid-generator",
  },
};

export default function UuidGeneratorPage() {
  const instructions = {
    title: "UUID / GUID Generator",
    steps: [
      "Select the UUID version: V4 (cryptographically random) or V1 (timestamp & MAC node address based).",
      "Use the count slider or direct inputs to choose how many UUIDs to generate at once (from 1 up to 500).",
      "Configure your formatting toggles: Upper Case letters, braces `{...}`, or remove hyphens `-` completely.",
      "Click 'Generate UUIDs' to trigger random string generation.",
      "Copy all results to your clipboard or download them as a local text file.",
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "UUID / GUID Generator",
    "url": "https://devtoolbox.com/tools/uuid-generator",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Free offline tool to bulk generate standard RFC 4122 compliant UUID strings in various formats.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="UUID / GUID Generator"
          description="Bulk generate random RFC 4122 compliant UUID (Universally Unique Identifier) or GUID strings. Run 100% locally in your browser."
          category="generators"
        />

        <ToolWrapper
          currentToolId="uuid-generator"
          currentCategory="generators"
          instructions={instructions}
        >
          <UuidGeneratorClient />
        </ToolWrapper>
      </div>
    </>
  );
}
