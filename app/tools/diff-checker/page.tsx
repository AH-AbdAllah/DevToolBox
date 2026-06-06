import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { DiffCheckerClient } from "./diff-checker-client";

export const metadata: Metadata = {
  title: "Online Side-by-Side Visual Diff Checker - Compare Text Codes",
  description:
    "Free client-side visual diff checker. Compare two text drafts or code files side-by-side. Highlights line insertions, deletions, and differences instantly.",
  keywords: [
    "diff checker",
    "compare text",
    "visual diff online",
    "code comparison",
    "git diff tool",
    "compare json",
    "text difference checker",
  ],
  openGraph: {
    title: "Side-by-Side Visual Diff Checker - DevToolBox",
    description:
      "Compare text inputs locally. Inspect additions, removals, and syntax edits with unified or split highlight views. Zero server data leaks.",
    type: "website",
    url: "https://devtoolbox.com/tools/diff-checker",
  },
  alternates: {
    canonical: "/tools/diff-checker",
  },
};

export default function DiffCheckerPage() {
  const instructions = {
    title: "Visual Diff Checker",
    steps: [
      "Paste your source or original text into the **Original Text (Old)** input box on the left.",
      "Paste your revised or updated text into the **Modified Text (New)** input box on the right.",
      "Tweak comparison configurations: ignore letter casing or strip leading/trailing whitespaces to focus on key changes.",
      "The tool calculates differences instantly. Deleted lines are highlighted in **red (with a - indicator)**, while added lines are highlighted in **green (with a + indicator)**.",
      "Verify matches line-by-line in the interactive diff results canvas below.",
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Side-by-Side Visual Diff Checker",
    "url": "https://devtoolbox.com/tools/diff-checker",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Free client-side tool to run visual line comparison diff checks on two separate text files.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="Side-by-Side Visual Diff Checker"
          description="Compare two text snippets or code drafts and instantly highlight what was added, removed, or changed. Executed locally."
          category="developers"
        />

        <ToolWrapper
          currentToolId="diff-checker"
          currentCategory="developers"
          instructions={instructions}
        >
          <DiffCheckerClient />
        </ToolWrapper>
      </div>
    </>
  );
}
