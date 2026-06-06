import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { ProjectValidatorClient } from "./project-validator-client";

export const metadata: Metadata = {
  title: "AI Project Idea Validator - Assess Side Projects",
  description:
    "Evaluate tech stack compatibility, SWOT analysis metrics, MVP scoping frameworks, and execution roadmaps for side projects. Secure, client-side, powered by Gemini.",
  keywords: [
    "project idea validator",
    "validate project",
    "AI startup evaluation",
    "SWOT analysis generator",
    "MVP core scoping",
    "side project helper",
    "Gemini validator",
  ],
  openGraph: {
    title: "AI Project Idea Validator - DevToolBox",
    description:
      "Assess your startup or side-project concepts, audit planned tech stacks, review SWOT quadrants, and define launch checklists securely using Gemini.",
    type: "website",
    url: "https://devtoolbox.com/tools/project-validator",
  },
  alternates: {
    canonical: "/tools/project-validator",
  },
};

export default function ProjectValidatorPage() {
  const instructions = {
    title: "AI Project Validator",
    steps: [
      "Verify you have configured your Gemini API Key using the 'Setup AI' button in the header menu.",
      "Enter the project name, target audience, and planned tech stack (e.g. Next.js, FastAPI, PostgreSQL).",
      "Describe the core functionality, monetization idea, or problems this project solves.",
      "Click 'Validate Project Idea' to run the evaluation using client-side Gemini AI.",
      "Analyze the parsed interactive SWOT quadrants, feasibility score meter, tech stack bottlenecks critique, and checklists.",
      "Use the MVP checklist to keep track of core tasks as you build.",
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Project Idea Validator",
    "url": "https://devtoolbox.com/tools/project-validator",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Free client-side AI project validator that reviews tech stack selections, generates SWOT matrix data, and recommends MVP execution schedules.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="AI Project Idea Validator"
          description="Submit startup ideas or developer side-projects to instantly review code/stack feasibility, build SWOT matrices, scope MVP core components, and organize next step timelines. Powered by Gemini."
          category="ai"
        />

        <ToolWrapper
          currentToolId="project-validator"
          currentCategory="ai"
          instructions={instructions}
        >
          <ProjectValidatorClient />
        </ToolWrapper>
      </div>
    </>
  );
}
