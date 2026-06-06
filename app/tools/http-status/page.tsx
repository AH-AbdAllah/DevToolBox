import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { HttpStatusClient } from "./http-status-client";

export const metadata: Metadata = {
  title: "HTTP Status Code Explorer - Search HTTP Response Codes",
  description:
    "Interactive online directory of all HTTP response status codes. Search, filter, and discover semantic meanings, RFC standards, and headers.",
  keywords: [
    "HTTP status codes",
    "HTTP response codes",
    "status code explorer",
    "HTTP headers",
    "RFC references",
    "404 client error",
    "500 server error",
    "HTTP status",
  ],
  openGraph: {
    title: "HTTP Status Code Explorer - DevToolBox",
    description:
      "Interactive guide to HTTP response status codes (1xx, 2xx, 3xx, 4xx, 5xx) with triggers and header mockups.",
    type: "website",
    url: "https://devtoolbox.com/tools/http-status",
  },
  alternates: {
    canonical: "/tools/http-status",
  },
};

export default function HttpStatusPage() {
  const instructions = {
    title: "HTTP Status Code Explorer",
    steps: [
      "Use the search bar to query a status code directly (e.g. '404') or keywords like 'unauthorized'.",
      "Click the filters at the top to isolate specific code series (e.g., 2xx Success, 4xx Client Error).",
      "Click any status code block to open the detailed inspector drawer on the right.",
      "Explore detailed RFC descriptions, common trigger scenarios, and sample server header mockups.",
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "HTTP Status Code Explorer",
    "url": "https://devtoolbox.com/tools/http-status",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Free interactive database and search explorer for all official IETF RFC HTTP status codes.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="HTTP Status Code Explorer"
          description="Browse and search HTTP response status codes with semantic descriptions, RFC references, triggers, and mock response headers."
          category="converters"
        />

        <ToolWrapper
          currentToolId="http-status-explorer"
          currentCategory="converters"
          instructions={instructions}
        >
          <HttpStatusClient />
        </ToolWrapper>
      </div>
    </>
  );
}
