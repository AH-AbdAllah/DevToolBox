import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { GithubAnalyzerClient } from "./github-analyzer-client";

export const metadata: Metadata = {
  title: "AI GitHub Repository Analyzer - Inspect Code Architecture",
  description:
    "Free client-side AI tool to analyze public GitHub repositories. Get architectural critics, code quality scores, and security assessments using Gemini.",
  keywords: [
    "GitHub analyzer",
    "repository analyzer",
    "AI code analyzer",
    "architecture critique",
    "inspect GitHub",
    "code quality check",
    "Gemini GitHub",
  ],
  openGraph: {
    title: "AI GitHub Repository Analyzer - DevToolBox",
    description:
      "Analyze public GitHub repository files or folder structures client-side using Gemini AI. Safe, private, and insightful.",
    type: "website",
    url: "https://devtoolbox.com/tools/github-analyzer",
  },
  alternates: {
    canonical: "/tools/github-analyzer",
  },
};

export default function GithubAnalyzerPage() {
  const instructions = {
    title: "AI GitHub Repo Analyzer",
    steps: [
      "Ensure you have configured your Gemini API Key using the 'Setup AI' button in the navigation bar.",
      "Enter a public GitHub Repository URL (e.g. `https://github.com/user/repo`) or paste a file-tree list.",
      "Specify the default branch (e.g., `main` or `master`).",
      "Enter key folders or files you want the AI to analyze closely (e.g., `app/`, `src/components/`).",
      "Click 'Analyze Repository' to initiate the secure client-side AI request.",
      "Review the structured review showing code quality metrics, architectural flows, and optimization recommendations.",
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI GitHub Repository Analyzer",
    "url": "https://devtoolbox.com/tools/github-analyzer",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Free AI-driven software architecture critic that evaluates public GitHub repositories for code quality and structural flows.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="AI GitHub Repo Analyzer"
          description="Evaluate open-source GitHub repositories to inspect code styles, generate architectural layer models, highlight bottlenecks, and review logic optimization. Powered by Gemini."
          category="ai"
        />

        <ToolWrapper
          currentToolId="github-analyzer"
          currentCategory="ai"
          instructions={instructions}
        >
          <GithubAnalyzerClient />
        </ToolWrapper>
      </div>
    </>
  );
}
