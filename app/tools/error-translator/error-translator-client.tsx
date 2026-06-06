"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

const LANGUAGES = [
  "JavaScript / Node.js",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C# / .NET",
  "C / C++",
  "PHP",
  "Ruby",
  "Bash / Shell",
  "SQL",
  "Docker",
  "Next.js / React",
  "Other / Unknown",
];

const SAMPLE_ERROR = `TypeError: Cannot read properties of null (reading 'map')
    at HomePageClient (home-page-client.tsx:181:42)
    at renderWithHooks (react-dom.development.js:15486:18)
    at mountIndeterminateComponent (react-dom.development.js:20103:13)
    at beginWork (react-dom.development.js:21626:16)
    at HTMLButtonElement.dispatch (jquery.js:5430:9)`;

export function ErrorTranslatorClient() {
  const [input, setInput] = useState("");
  const [context, setContext] = useState("");
  const [language, setLanguage] = useState("JavaScript / Node.js");
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

  // Load sandbox transfer inputs on mount
  useEffect(() => {
    const transfer = sessionStorage.getItem("sandbox_transfer_input");
    if (transfer) {
      setInput(transfer);
      sessionStorage.removeItem("sandbox_transfer_input");
      const apiKey = localStorage.getItem("gemini_api_key");
      if (apiKey) {
        setTimeout(() => {
          handleAnalyze(transfer);
        }, 50);
      }
    }
  }, []);

  const handleClear = () => {
    setInput("");
    setContext("");
    setOutput("");
    setErrorMsg(null);
    setMobileTab("input");
  };

  const loadSample = () => {
    setInput(SAMPLE_ERROR);
    setLanguage("JavaScript / Node.js");
    setContext("I was clicking the Reset filters button on the tool catalog page.");
  };

  // Triggers Gemini API fetch client-side
  const handleAnalyze = async (overrideInput?: string) => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      // Prompt opening API key configuration modal
      window.dispatchEvent(new Event("open-api-key-modal"));
      return;
    }

    const activeInput = overrideInput !== undefined ? overrideInput : input;
    if (!activeInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setOutput("");
    setMobileTab("output");

    const promptText = `You are an expert software engineer and debugger. Analyze the following compiler log or stack trace error.

Please provide:
1. A clear "Translation of Error" explaining in simple, human developer terms what went wrong.
2. A bullet list of "Likely Root Causes" that can trigger this error.
3. Step-by-step "Fix Guidelines" with copy-pasteable code examples showing bad code vs good corrected code.

Programming Language / Framework: ${language}
Optional context of prior actions: ${context || "None provided"}

Raw Exception / Stack Trace:
\`\`\`
${activeInput}
\`\`\`

Format your output in clean Markdown with clear ### subheadings. Keep explanations concise and actionable.`;

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
      {/* Key Banner Alert */}
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

      {/* Mobile Tab swapper */}
      <div className="lg:hidden flex rounded-lg border border-input p-0.5 bg-background">
        <button
          onClick={() => setMobileTab("input")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "input"
              ? "bg-secondary text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Diagnostic inputs
        </button>
        <button
          onClick={() => setMobileTab("output")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "output"
              ? "bg-secondary text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          AI Diagnostics {output || errorMsg ? "•" : ""}
        </button>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostic Input Section */}
        <div className={mobileTab !== "input" ? "hidden lg:block space-y-6" : "space-y-6"}>
          <Card className="border-border">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center">
                <Icon name="Terminal" className="w-4 h-4 mr-2 text-primary" />
                <span>Exception / Log Input</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={loadSample}>
                  Load Sample
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClear} title="Clear Inputs">
                  <Icon name="Trash" className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              {/* Raw Trace Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="stack-trace-input">
                  Error Message or Stack Trace
                </label>
                <Textarea
                  id="stack-trace-input"
                  placeholder="Paste compiler stack trace or error log dump here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  mono
                  className="h-44 text-xs font-mono"
                />
              </div>

              {/* Language Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="language-select">
                  Language / Framework Context
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-10 px-3 border border-input rounded-lg bg-card text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all text-foreground"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action context */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="context-input">
                  Prior Actions / Trigger Triggers (Optional)
                </label>
                <Textarea
                  id="context-input"
                  placeholder="E.g., I just ran npm run dev after installing Tailwind, or clicked the login button..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="h-20 text-xs"
                />
              </div>
            </CardContent>

            <div className="flex justify-end p-4 border-t border-border bg-muted/10">
              <Button onClick={() => handleAnalyze()} disabled={!input.trim() || loading} className="w-full sm:w-auto">
                {loading ? (
                  <span className="flex items-center space-x-1.5">
                    <Icon name="Compass" className="w-4 h-4 animate-spin" />
                    <span>Analyzing Log...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5">
                    <Icon name="Sparkles" className="w-4 h-4" />
                    <span>Translate & Debug</span>
                  </span>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Diagnostic Output Section */}
        <div className={mobileTab !== "output" ? "hidden lg:block" : ""}>
          <Card className="border-border flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center">
                <Icon name="ShieldAlert" className="w-4 h-4 mr-2 text-primary" />
                <span>AI Diagnostics Report</span>
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
                    <h4 className="text-sm font-bold">Analyzing Stack Trace</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                      Translating logs and querying model details. This will take a brief moment...
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
                      Verify that you entered a valid API Key and that you have internet connectivity.
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
                    <h4 className="text-sm font-bold">No Diagnostics Generated</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Inputs are analyzed directly on your device. Enter a log and click Translate & Debug to generate solutions.
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
    <div className="space-y-5 text-sm leading-relaxed text-foreground/95 select-text">
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
