import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { Base64Client } from "./base64-client";

export const metadata: Metadata = {
  title: "Online Base64 Encoder / Decoder - Encode Text & Files",
  description:
    "Free client-side tool to encode text or files to Base64 and decode Base64 strings. Supports URL-safe formats, image/binary files, and instant copy-to-clipboard.",
  keywords: [
    "base64 encoder",
    "base64 decoder",
    "encode file to base64",
    "decode base64 to text",
    "url safe base64",
    "convert image to base64",
    "binary to base64",
  ],
  openGraph: {
    title: "Online Base64 Encoder / Decoder - DevToolBox",
    description:
      "Convert text and file assets to Base64 format or parse standard base64 strings safely inside your browser. No files are uploaded to servers.",
    type: "website",
    url: "https://devtoolbox.com/tools/base64-decoder",
  },
  alternates: {
    canonical: "/tools/base64-decoder",
  },
};

export default function Base64DecoderPage() {
  const instructions = {
    title: "Base64 Encoder / Decoder",
    steps: [
      "Select your input format: choose 'Text Input' for string messages or 'File Upload' for images, document assets, or binaries.",
      "Select your operations mode: toggle between 'Encode' (Text/File to Base64) and 'Decode' (Base64 to Text).",
      "For text operations, type or paste your code. The conversion runs instantly. Enable 'URL-safe base64' to automatically translate standard symbols (+ to - and / to _).",
      "For file encoding, drop your file inside the drag-and-drop area. The tool will parse it and generate the raw Base64 string, Data URL wrapper, and custom HTML/CSS embeds.",
      "Copy the formatted result or trigger a download file task.",
    ],
  };

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Base64 Encoder / Decoder",
    "url": "https://devtoolbox.com/tools/base64-decoder",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Convert strings or file resources into Base64 formats, or decode Base64 strings into text outputs securely.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="Base64 Encoder / Decoder"
          description="Encode text or binary files to Base64 representation, or decode Base64 strings back to text. Runs entirely client-side."
          category="encoders"
        />

        <ToolWrapper
          currentToolId="base64-decoder"
          currentCategory="encoders"
          instructions={instructions}
        >
          <Base64Client />
        </ToolWrapper>
      </div>
    </>
  );
}
