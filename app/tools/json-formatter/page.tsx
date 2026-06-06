import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { JsonFormatterClient } from "./json-formatter-client";

export const metadata: Metadata = {
  title: "Online JSON Formatter & Validator - Clean & Inspect JSON",
  description:
    "Free online tool to format, beautify, minify, and validate JSON data instantly. Features error line tracking, collapsible tree-view inspector, and secure client-side parsing.",
  keywords: [
    "JSON formatter",
    "JSON validator",
    "JSON beautifier",
    "JSON parser",
    "format JSON",
    "minify JSON",
    "interactive tree view",
    "offline JSON editor",
  ],
  openGraph: {
    title: "Online JSON Formatter & Validator - DevToolBox",
    description:
      "Beautify, validate, minify, and inspect JSON structures in real-time. Designed to be fast, client-side secure, and feature-rich.",
    type: "website",
    url: "https://devtoolbox.com/tools/json-formatter",
  },
  alternates: {
    canonical: "/tools/json-formatter",
  },
};

export default function JsonFormatterPage() {
  const instructions = {
    title: "JSON Formatter & Validator",
    steps: [
      "Paste your raw JSON text into the Input editor or upload a local .json file.",
      "Click 'Beautify' to indent and structure your JSON. You can customize the indentation level (2 spaces, 4 spaces, or tabs) using the configuration controls.",
      "If there are formatting errors in your input, the system will highlight the exact line and position of the parser exception.",
      "Click 'Minify' to remove all unnecessary whitespace, spaces, and linebreaks from the JSON object.",
      "Toggle the 'Tree View' tab to interactively explore the parsed keys and nested objects in a collapsible visual tree.",
      "Copy the result to your clipboard or download it as a local text file.",
    ],
  };

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "JSON Formatter & Validator",
    "url": "https://devtoolbox.com/tools/json-formatter",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Free client-side tool to validate, format, beautify, and inspect JSON strings with structural tree explorer.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="JSON Formatter & Validator"
          description="Beautify, validate, minify, and inspect JSON data. All parsing and operations run client-side in your browser."
          category="formatters"
        />

        <ToolWrapper
          currentToolId="json-formatter"
          currentCategory="formatters"
          instructions={instructions}
        >
          <JsonFormatterClient />
        </ToolWrapper>
      </div>
    </>
  );
}
