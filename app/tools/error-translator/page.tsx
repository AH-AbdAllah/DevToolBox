import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { ErrorTranslatorClient } from "./error-translator-client";

export const metadata: Metadata = {
  title: "AI Error Translator & Debugger - Translate & Fix Developer Logs",
  description:
    "Free client-side AI tool to translate complex stack traces, cryptic compiler exceptions, and log dumps into plain explanations and actionable code solutions using Gemini.",
  keywords: [
    "AI debugger",
    "error translator",
    "stack trace analyzer",
    "compiler exception solver",
    "code debugger",
    "Gemini code solver",
    "developer intelligence",
  ],
  openGraph: {
    title: "AI Error Translator & Debugger - DevToolBox",
    description:
      "Translate cryptic trace dumps and compiler logs into readable fixes using client-side Gemini AI. Safe, private, and fast.",
    type: "website",
    url: "https://devtoolbox.com/tools/error-translator",
  },
  alternates: {
    canonical: "/tools/error-translator",
  },
};

export default function ErrorTranslatorPage() {
  const instructions = {
    title: "AI Error Translator & Debugger",
    steps: [
      "Ensure you have configured your Gemini API Key using the 'Setup AI' button in the navigation bar.",
      "Paste your raw trace log, compiler output, or syntax error dump into the Input editor.",
      "Select the programming language or framework associated with the error.",
      "Optionally, provide additional context (what actions or triggers occurred just before the crash).",
      "Click 'Translate & Debug' to initiate the secure client-side AI request.",
      "Review the structured markdown analysis showing explanations, potential triggers, and copy-pasteable code fixes.",
    ],
  };

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Error Translator & Debugger",
    "url": "https://devtoolbox.com/tools/error-translator",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Free AI-driven debugger tool that translates trace logs and compiler exceptions into clear explanations and code solutions.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="AI Error Translator & Debugger"
          description="Translate stack traces, compiler logs, and exception dumps into simple explanations and copy-pasteable code fixes. Powered by Gemini."
          category="ai"
        />

        <ToolWrapper
          currentToolId="error-translator"
          currentCategory="ai"
          instructions={instructions}
        >
          <ErrorTranslatorClient />
        </ToolWrapper>
      </div>
    </>
  );
}
