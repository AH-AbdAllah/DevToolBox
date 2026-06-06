"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

const SAMPLE_REPOS = [
  { url: "https://github.com/facebook/react", branch: "main", focus: "packages/react-reconciler" },
  { url: "https://github.com/vercel/next.js", branch: "canary", focus: "packages/next" },
];

export function GithubAnalyzerClient() {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [focusPaths, setFocusPaths] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [mobileTab, setMobileTab] = useState<"input" | "output">("input");

  // Sync API Key status
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

  const handleClear = () => {
    setRepoUrl("");
    setBranch("main");
    setFocusPaths("");
    setOutput("");
    setErrorMsg(null);
    setMobileTab("input");
  };

  const loadSample = (index: number) => {
    const sample = SAMPLE_REPOS[index];
    setRepoUrl(sample.url);
    setBranch(sample.branch);
    setFocusPaths(sample.focus);
  };

  const handleAnalyze = async () => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      window.dispatchEvent(new Event("open-api-key-modal"));
      return;
    }

    if (!repoUrl.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setOutput("");
    setMobileTab("output");

    const promptText = `You are an expert software architect. Analyze the public GitHub repository at:
    Repository URL: ${repoUrl}
    Target Branch: ${branch}
    Focus Directories/Files: ${focusPaths || "Entire structure"}

    Please analyze the likely architecture, dependency models, and code structures of this repository. Provide:
    1. An "Architectural Layer Summary" detailing the design pattern, components layer layout, and routing logic.
    2. A "Code Quality & Structural Review" outlining folder hygiene, conventions, and dependency choices.
    3. An "Optimization & Security Checklist" mapping bottlenecks, performance concerns, and caching opportunities.

    Format your output in clean Markdown with clear ### subheadings. Keep details technical, realistic, and highly actionable.`;

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
              temperature: 0.25,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to contact Gemini API. Verify your API Key.");
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error("Received an empty response from the AI model. Try again.");
      }

      setOutput(generatedText);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred while processing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Warning */}
      {!hasKey && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500 gap-4 animate-fade-in">
          <div className="flex items-start space-x-3">
            <Icon name="AlertCircle" className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wider">Gemini API Key Needed</h4>
              <p className="text-xs text-muted-foreground">
                To run AI tools, set your Gemini API key. Keys are free to get, stored locally, and never leave your browser.
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
          Repo Info
        </button>
        <button
          onClick={() => setMobileTab("output")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "output"
              ? "bg-secondary text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          AI Architecture Critic {output || errorMsg ? "•" : ""}
        </button>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repo parameters */}
        <div className={mobileTab !== "input" ? "hidden lg:block space-y-6" : "space-y-6"}>
          <Card className="border-border">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center">
                <Icon name="Terminal" className="w-4 h-4 mr-2 text-primary" />
                <span>GitHub Repository Details</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => loadSample(0)}>
                  Sample React
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => loadSample(1)}>
                  Sample Next
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClear} title="Clear">
                  <Icon name="Trash" className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4 space-y-4 text-xs">
              {/* Repo URL */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">GitHub Repository URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/facebook/react"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full h-10 px-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all font-mono"
                />
              </div>

              {/* Branch select */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Default / Target Branch</label>
                <input
                  type="text"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full h-10 px-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all font-mono"
                />
              </div>

              {/* Specific folders context */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Specific Paths to Focus (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g., src/components, package.json"
                  value={focusPaths}
                  onChange={(e) => setFocusPaths(e.target.value)}
                  className="w-full h-10 px-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all font-mono"
                />
                <span className="text-[10px] text-muted-foreground">
                  Focusing specific folders yields more detailed reviews of file layout conventions.
                </span>
              </div>
            </CardContent>

            <div className="flex justify-end p-4 border-t border-border bg-muted/10">
              <Button onClick={handleAnalyze} disabled={!repoUrl.trim() || loading} className="w-full sm:w-auto">
                {loading ? (
                  <span className="flex items-center space-x-1.5">
                    <Icon name="Compass" className="w-4 h-4 animate-spin" />
                    <span>Analyzing Repo...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5">
                    <Icon name="Sparkles" className="w-4 h-4" />
                    <span>Analyze Repository</span>
                  </span>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Output pane */}
        <div className={mobileTab !== "output" ? "hidden lg:block animate-fade-in" : "animate-fade-in"}>
          <Card className="border-border flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center">
                <Icon name="ShieldAlert" className="w-4 h-4 mr-2 text-primary" />
                <span>AI Architectural Report</span>
              </span>
              {output && !loading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="h-8 px-2"
                >
                  <Icon name="Copy" className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">Copy Report</span>
                </Button>
              )}
            </div>
            <CardContent className="p-6 flex-1 overflow-auto bg-card">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[350px] space-y-4">
                  <Icon name="Compass" className="w-8 h-8 text-primary animate-spin" />
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold animate-pulse">Running Code Audit</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                      Mapping structure layouts and assessing patterns. This takes a brief moment...
                    </p>
                  </div>
                </div>
              ) : errorMsg ? (
                <div className="p-5 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive flex items-start space-x-3 text-xs leading-relaxed font-mono">
                  <Icon name="AlertCircle" className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="font-bold">Error Processing Request</p>
                    <p>{errorMsg}</p>
                    <p className="text-[10px] text-muted-foreground/80 leading-normal">
                      Verify that your API Key is valid and that the target repository is public.
                    </p>
                  </div>
                </div>
              ) : output ? (
                <RenderMarkdown text={output} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/50">
                    <Icon name="Sparkles" className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <h4 className="text-sm font-bold">No Analysis Generated</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Inputs are validated client-side. Supply a public GitHub path and click Analyze to review structural styles.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Simple React Custom Markdown Renderer
function RenderMarkdown({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-5 text-sm leading-relaxed text-foreground/95 select-text animate-fade-in">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : "code";
          const code = match ? match[2].trim() : part.slice(3, -3).trim();
          return (
            <div key={index} className="rounded-lg border border-border bg-slate-950 overflow-hidden font-mono text-xs my-3 shadow-inner select-all">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-slate-900 text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">{lang || "code"}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-200 cursor-pointer"
                  title="Copy code block"
                >
                  <Icon name="Copy" className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-4 overflow-auto text-slate-200 leading-relaxed whitespace-pre-wrap">{code}</pre>
            </div>
          );
        }

        const lines = part.split("\n");
        return (
          <div key={index} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Headers
              if (trimmed.startsWith("### ")) {
                return (
                  <h4 key={lIdx} className="text-sm font-bold text-indigo-400 pt-3 flex items-center">
                    <span className="w-1.5 h-3.5 bg-indigo-500 rounded mr-2" />
                    {trimmed.slice(4)}
                  </h4>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={lIdx} className="text-base font-bold text-foreground border-b border-border/40 pb-1.5 pt-4">
                    {trimmed.slice(3)}
                  </h3>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={lIdx} className="text-lg font-bold text-foreground pt-4">
                    {trimmed.slice(2)}
                  </h2>
                );
              }

              // Bullet lists
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <ul key={lIdx} className="list-disc pl-5 text-xs text-muted-foreground/90 my-0.5">
                    <li className="leading-relaxed">{parseInlineStyles(trimmed.slice(2))}</li>
                  </ul>
                );
              }

              // Default paragraph
              return (
                <p key={lIdx} className="text-xs text-muted-foreground/90 leading-relaxed my-1">
                  {parseInlineStyles(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Parse inline **bold**
function parseInlineStyles(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-foreground/95">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
