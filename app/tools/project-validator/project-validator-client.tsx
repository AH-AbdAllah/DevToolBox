"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

interface ValidationResult {
  summary: string;
  feasibilityScore: number;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  mvpFeatures: Array<{ title: string; description: string }>;
  stackAudit: {
    complexity: string;
    speedRating: string;
    analysis: string;
  };
  checklist: string[];
}

const SAMPLE_PROJECT = {
  name: "RecipeRoulette",
  description: "A swipe-based recipe matching app. Users swipe right to like cooking a meal, or swipe left to skip. If they match, it reveals the step-by-step recipe, directions, and ingredients checklist. Users can filter recipes based on diet types (keto, vegan, gluten-free) and average prep time.",
  audience: "Busy college students, home cooks, and people who experience meal decision fatigue.",
  techStack: "Next.js 14 App Router, Tailwind CSS, Supabase (Auth, PostgreSQL DB, Vector database for ingredients search, Storage for food photos)",
};

export function ProjectValidatorClient() {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [techStack, setTechStack] = useState("");
  
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [mobileTab, setMobileTab] = useState<"input" | "dashboard">("input");

  // Keep track of interactive checked items
  const [checkedFeatures, setCheckedFeatures] = useState<Record<number, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  // Sync API Key status on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    setHasKey(!!savedKey);

    const handleKeyUpdate = () => {
      const updatedKey = localStorage.getItem("gemini_api_key");
      setHasKey(!!updatedKey);
    };

    window.addEventListener("api-key-updated", handleKeyUpdate);
    return () => window.removeEventListener("api-key-updated", handleKeyUpdate);
  }, []);

  // Mount check for sandbox transfers
  useEffect(() => {
    const transfer = sessionStorage.getItem("sandbox_transfer_input");
    if (transfer) {
      setProjectDescription(transfer);
      sessionStorage.removeItem("sandbox_transfer_input");

      const apiKey = localStorage.getItem("gemini_api_key");
      if (apiKey) {
        setTimeout(() => {
          handleValidate("", transfer, "", "");
        }, 50);
      }
    }
  }, []);

  const handleClear = () => {
    setProjectName("");
    setProjectDescription("");
    setTargetAudience("");
    setTechStack("");
    setResult(null);
    setErrorMsg(null);
    setCheckedFeatures({});
    setCheckedSteps({});
    setMobileTab("input");
  };

  const loadSample = () => {
    setProjectName(SAMPLE_PROJECT.name);
    setProjectDescription(SAMPLE_PROJECT.description);
    setTargetAudience(SAMPLE_PROJECT.audience);
    setTechStack(SAMPLE_PROJECT.techStack);
  };

  const handleValidate = async (
    overrideName?: string,
    overrideDesc?: string,
    overrideAudience?: string,
    overrideStack?: string
  ) => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      window.dispatchEvent(new Event("open-api-key-modal"));
      return;
    }

    const activeName = overrideName !== undefined && overrideName !== "" ? overrideName : projectName;
    const activeDesc = overrideDesc !== undefined && overrideDesc !== "" ? overrideDesc : projectDescription;
    const activeAudience = overrideAudience !== undefined && overrideAudience !== "" ? overrideAudience : targetAudience;
    const activeStack = overrideStack !== undefined && overrideStack !== "" ? overrideStack : techStack;

    if (!activeDesc.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setCheckedFeatures({});
    setCheckedSteps({});
    setMobileTab("dashboard");

    const promptText = `You are a world-class startup product consultant and software architect. Evaluate this project idea:
    Project Name: ${activeName || "Unnamed Side-Project"}
    Description: ${activeDesc}
    Target Audience: ${activeAudience || "General public / Developers"}
    Planned Tech Stack: ${activeStack || "Not specified / standard web stack"}

    Analyze the technical feasibility, SWOT parameters, MVP features list, stack complexity, and execution roadmaps.
    Return ONLY a valid JSON object matching the following structure. Do NOT wrap it in any formatting text or backticks:
    {
      "summary": "feasibility critique summary (2-3 sentences)",
      "feasibilityScore": 85, // Integer score from 1 to 100 based on development speed, audience sizes, and stack ease.
      "swot": {
        "strengths": ["...", "..."],
        "weaknesses": ["...", "..."],
        "opportunities": ["...", "..."],
        "threats": ["...", "..."]
      },
      "mvpFeatures": [
        { "title": "Core Feature", "description": "Short explanation of the feature" }
      ],
      "stackAudit": {
        "complexity": "Low/Medium/High",
        "speedRating": "Slow/Moderate/Fast",
        "analysis": "suitability review of planned stack"
      },
      "checklist": [
        "First step tasks",
        "Verification step tasks",
        "Production launch tasks"
      ]
    }`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to query Gemini API. Double check your API credentials.");
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error("AI engine returned an empty response. Try submitting your idea again.");
      }

      const parsedResult = JSON.parse(generatedText) as ValidationResult;
      setResult(parsedResult);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during valuation parsing.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle checkbox state helper
  const toggleFeature = (index: number) => {
    setCheckedFeatures((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Helper colors for feasibility score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 50) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    return "text-rose-500 border-rose-500/20 bg-rose-500/5";
  };

  return (
    <div className="space-y-6">
      {/* API Key Banner Warning */}
      {!hasKey && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500 gap-4 animate-fade-in">
          <div className="flex items-start space-x-3">
            <Icon name="AlertCircle" className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wider">Gemini API Key Needed</h4>
              <p className="text-xs text-muted-foreground">
                To activate AI analysis, add your Gemini API Key. Keys are stored locally on your device and are never sent to external servers.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.dispatchEvent(new Event("open-api-key-modal"))}
            className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 shrink-0 cursor-pointer"
          >
            Setup Key
          </Button>
        </div>
      )}

      {/* Mobile Tab Swapper */}
      <div className="lg:hidden flex rounded-lg border border-input p-0.5 bg-background">
        <button
          onClick={() => setMobileTab("input")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "input"
              ? "bg-secondary text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Project Scope
        </button>
        <button
          onClick={() => setMobileTab("dashboard")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "dashboard"
              ? "bg-secondary text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          AI Diagnostics {result || errorMsg ? "•" : ""}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Form: Inputs Pane */}
        <div className={`lg:col-span-2 ${mobileTab !== "input" ? "hidden lg:block space-y-6" : "space-y-6"}`}>
          <Card className="border-border">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center">
                <Icon name="Terminal" className="w-4 h-4 mr-2 text-primary" />
                <span>Project Concept Form</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={loadSample}>
                  Load Demo
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClear} title="Clear Inputs">
                  <Icon name="Trash" className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>

            <CardContent className="p-4 space-y-4 text-xs">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground" htmlFor="project-name-input">
                  Project Name (Optional)
                </label>
                <input
                  id="project-name-input"
                  type="text"
                  placeholder="E.g., RecipeRoulette"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full h-10 px-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground" htmlFor="project-desc-input">
                  Description / Core Mechanics (Required)
                </label>
                <Textarea
                  id="project-desc-input"
                  placeholder="Explain your app idea. How does it work? What problems does it solve?..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="h-32 text-xs"
                />
              </div>

              {/* Audience */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground" htmlFor="project-audience-input">
                  Target Audience (Optional)
                </label>
                <input
                  id="project-audience-input"
                  type="text"
                  placeholder="E.g., College students, busy parents, remote workers"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full h-10 px-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              {/* Stack */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground" htmlFor="project-stack-input">
                  Planned Tech Stack (Optional)
                </label>
                <input
                  id="project-stack-input"
                  type="text"
                  placeholder="E.g., React, Node, PostgreSQL, Tailwind"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full h-10 px-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>
            </CardContent>

            <div className="flex justify-end p-4 border-t border-border bg-muted/10">
              <Button
                onClick={() => handleValidate()}
                disabled={!projectDescription.trim() || loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <span className="flex items-center space-x-1.5">
                    <Icon name="Compass" className="w-4 h-4 animate-spin" />
                    <span>Evaluating Idea...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5">
                    <Icon name="Sparkles" className="w-4 h-4" />
                    <span>Validate Project Idea</span>
                  </span>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Dashboard: AI Diagnostics Output */}
        <div className={`lg:col-span-3 ${mobileTab !== "dashboard" ? "hidden lg:block animate-fade-in" : "animate-fade-in"}`}>
          {loading ? (
            <Card className="h-full min-h-[500px] flex flex-col items-center justify-center border-border p-6 text-center space-y-4">
              <Icon name="Compass" className="w-8 h-8 text-primary animate-spin" />
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold animate-pulse text-foreground">Assembling Validation Matrix</h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Running tech stack evaluations, mapping SWOT quadrants, and generating task scopes. This will take a moment...
                </p>
              </div>
            </Card>
          ) : errorMsg ? (
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="p-5 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive flex items-start space-x-3 text-xs leading-relaxed font-mono">
                  <Icon name="AlertCircle" className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="font-bold">Valuation Interrupted</p>
                    <p>{errorMsg}</p>
                    <p className="text-[10px] text-muted-foreground/80 leading-normal">
                      Confirm you entered a valid API Key and have proper internet connection.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : result ? (
            <div className="space-y-6">
              
              {/* Feasibility score banner */}
              <div className="p-5 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-bold text-foreground">Idea Viability Assessment</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {result.summary}
                  </p>
                </div>
                <div className={`w-20 h-20 rounded-full border flex flex-col items-center justify-center shrink-0 shadow-sm ${getScoreColor(result.feasibilityScore)}`}>
                  <span className="text-2xl font-extrabold leading-none">{result.feasibilityScore}</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75 mt-0.5">Score</span>
                </div>
              </div>

              {/* SWOT Matrix Grid */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                  <Icon name="Compass" className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  <span>SWOT Analysis Quadrants</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-500">
                      <Icon name="Check" className="w-4 h-4" />
                      <span className="text-xs font-bold">Strengths (S)</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                      {result.swot.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-emerald-500/70 mr-1.5 font-bold">•</span>
                          <span className="leading-relaxed">{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
                    <div className="flex items-center space-x-2 text-rose-500">
                      <Icon name="AlertCircle" className="w-4 h-4" />
                      <span className="text-xs font-bold">Weaknesses (W)</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                      {result.swot.weaknesses.map((wk, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-rose-500/70 mr-1.5 font-bold">•</span>
                          <span className="leading-relaxed">{wk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 space-y-2">
                    <div className="flex items-center space-x-2 text-sky-500">
                      <Icon name="Sparkles" className="w-4 h-4" />
                      <span className="text-xs font-bold">Opportunities (O)</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                      {result.swot.opportunities.map((op, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-sky-500/70 mr-1.5 font-bold">•</span>
                          <span className="leading-relaxed">{op}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-500">
                      <Icon name="ShieldAlert" className="w-4 h-4" />
                      <span className="text-xs font-bold">Threats (T)</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                      {result.swot.threats.map((thr, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-amber-500/70 mr-1.5 font-bold">•</span>
                          <span className="leading-relaxed">{thr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tech stack critique */}
              <Card className="border-border">
                <CardHeader className="py-3 bg-muted/10 border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon name="Cpu" className="w-4 h-4 text-primary" />
                      <CardTitle className="text-xs font-bold uppercase tracking-wider">Tech Stack Audit</CardTitle>
                    </div>
                    <div className="flex space-x-2 scale-90">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary border border-border text-muted-foreground">
                        Complexity: {result.stackAudit.complexity}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary">
                        Speed: {result.stackAudit.speedRating}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 text-xs leading-relaxed text-muted-foreground">
                  <p>{result.stackAudit.analysis}</p>
                </CardContent>
              </Card>

              {/* MVP Checklist */}
              <Card className="border-border">
                <CardHeader className="py-3 bg-muted/10 border-b border-border/60">
                  <div className="flex items-center space-x-2">
                    <Icon name="Braces" className="w-4 h-4 text-primary" />
                    <CardTitle className="text-xs font-bold uppercase tracking-wider">Suggested MVP Scope</CardTitle>
                  </div>
                  <CardDescription className="text-[10px]">Toggle features to track your MVP development.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {result.mvpFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleFeature(idx)}
                      className="flex items-start space-x-3 p-2.5 rounded-lg border border-border/40 hover:bg-muted/10 cursor-pointer select-none transition-colors"
                    >
                      <button
                        type="button"
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                          checkedFeatures[idx] ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background"
                        }`}
                      >
                        {checkedFeatures[idx] && <Icon name="Check" className="w-3.5 h-3.5" />}
                      </button>
                      <div className="space-y-0.5">
                        <h5 className={`text-xs font-semibold leading-none ${checkedFeatures[idx] ? "line-through text-muted-foreground/60" : "text-foreground"}`}>
                          {feat.title}
                        </h5>
                        <p className={`text-[11px] leading-relaxed ${checkedFeatures[idx] ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Next Steps Roadmap */}
              <Card className="border-border">
                <CardHeader className="py-3 bg-muted/10 border-b border-border/60">
                  <div className="flex items-center space-x-2">
                    <Icon name="Terminal" className="w-4 h-4 text-primary" />
                    <CardTitle className="text-xs font-bold uppercase tracking-wider">Execution Checklist</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5">
                  {result.checklist.map((step, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className="flex items-start space-x-3 select-none cursor-pointer group"
                    >
                      <button
                        type="button"
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                          checkedSteps[idx] ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background"
                        }`}
                      >
                        {checkedSteps[idx] && <Icon name="Check" className="w-3.5 h-3.5" />}
                      </button>
                      <span className={`text-xs leading-relaxed ${checkedSteps[idx] ? "line-through text-muted-foreground/60" : "text-muted-foreground group-hover:text-foreground"}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>
          ) : (
            <Card className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 border-border bg-card/40 space-y-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/35 animate-pulse">
                <Icon name="Sparkles" className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Waiting for Concept Input</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Fill in your startup idea description and planned technical stack in the form, then trigger the evaluation.
                </p>
              </div>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
