import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { InterviewSimulatorClient } from "./interview-simulator-client";

export const metadata: Metadata = {
  title: "AI Technical Mock Interview Simulator - Practice Tech Interviews",
  description:
    "Free client-side AI mock technical interview simulator. Select developer roles, answer conceptual questions, and get instant score evaluations using Gemini.",
  keywords: [
    "AI interview simulator",
    "mock interview developer",
    "technical interview practice",
    "practice coding interview",
    "frontend mock interview",
    "backend mock interview",
    "Gemini interview simulator",
  ],
  openGraph: {
    title: "AI Technical Mock Interview Simulator - DevToolBox",
    description:
      "Practice mock coding and technical design interviews locally in your browser. Get detailed diagnostic reports and scores.",
    type: "website",
    url: "https://devtoolbox.com/tools/interview-simulator",
  },
  alternates: {
    canonical: "/tools/interview-simulator",
  },
};

export default function InterviewSimulatorPage() {
  const instructions = {
    title: "AI Technical Interview Simulator",
    steps: [
      "Ensure you have configured your Gemini API Key using the 'Setup AI' button in the navigation bar.",
      "Select your target developer role (e.g. Frontend, Backend, DevOps, Fullstack).",
      "Select your experience level (Junior, Mid-level, Senior) to calibrate question difficulty.",
      "Click 'Start Interview' to initiate the mock exam.",
      "Read the AI interviewer's question, type your answer, and click 'Submit Answer'.",
      "The simulator runs for 4 rounds of technical questions. Once finished, you will receive a diagnostic card grading your answers, strengths, and study plans.",
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Technical Mock Interview Simulator",
    "url": "https://devtoolbox.com/tools/interview-simulator",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Free client-side AI mock interviewer that conducts simulated developer job interviews and grades answers.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="AI Interview Simulator"
          description="Conduct technical mock interviews with conceptual questions, step-by-step scoring, and comprehensive feedback. Powered by Gemini."
          category="ai"
        />

        <ToolWrapper
          currentToolId="interview-simulator"
          currentCategory="ai"
          instructions={instructions}
        >
          <InterviewSimulatorClient />
        </ToolWrapper>
      </div>
    </>
  );
}
