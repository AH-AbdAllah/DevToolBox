"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Card, CardContent } from "@/components/ui/card";
import { TOOLS, CATEGORIES, FAQS } from "@/lib/tools-data";
import { ToolCategory } from "@/types";

const SAMPLES = {
  json: `{
  "projectName": "DevToolBox",
  "version": 2.0,
  "developer": "Alice",
  "config": {
    "status": "active",
    "offlineFirst": true
  },
  "modules": ["sandbox", "palette", "detector"]
}`,
  base64: "SGVsbG8gRGV2ZWxvcGVyISBXZWxjb21lIHRvIERldlRvb2xCb3ggVW5pdmVyc2FsIFNhbmRib3gu",
  jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.signature_placeholder",
  ip: "192.168.1.1/24",
  error: `TypeError: Cannot read properties of undefined (reading 'map')
    at HomePageClient (home-page-client.tsx:215:30)
    at renderWithHooks (react-dom.development.js:15486:18)
    at mountIndeterminateComponent (react-dom.development.js:20103:13)
    at beginWork (react-dom.development.js:21626:16)`,
  uuid: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
  github: "https://github.com/facebook/react",
};

export function HomePageClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"workspace" | "tools">("workspace");
  const [sandboxText, setSandboxText] = useState("");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [showOnlyImplemented, setShowOnlyImplemented] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Traditional Catalog filters (retained at the bottom)
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<ToolCategory | "all">("all");

  // Terminal Console State
  const [terminalLogs, setTerminalLogs] = useState<Array<{ type: "input" | "output"; text: string }>>([
    { type: "output", text: "DevToolBox Intelligence Command Line [Version 2.1.0]" },
    { type: "output", text: "(c) 2026 DevToolBox. Standard sandbox terminal interface." },
    { type: "output", text: "Type 'help' to display list of executable scripts." },
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Sync API Key status on mount and register events
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    setHasApiKey(!!savedKey);

    const handleKeyUpdate = () => {
      const updatedKey = localStorage.getItem("gemini_api_key");
      setHasApiKey(!!updatedKey);
    };

    window.addEventListener("api-key-updated", handleKeyUpdate);
    return () => {
      window.removeEventListener("api-key-updated", handleKeyUpdate);
    };
  }, []);

  // Scroll terminal logs to bottom on add
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  // Handle smooth scroll hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Check if tool is implemented
  const isToolImplemented = (id: string) => {
    return [
      "json-formatter",
      "base64-decoder",
      "password-generator",
      "csv-json-converter",
      "tailwind-playground",
      "crypto-sandbox",
      "subnet-calculator",
      "diff-checker",
      "error-translator",
      "jwt-decoder",
      "uuid-generator",
      "http-status-explorer",
      "github-analyzer",
      "interview-simulator",
      "project-validator",
    ].includes(id);
  };

  // Launch Command Palette Modal (Dispatches Ctrl+K to sync with layout header hook)
  const handleLaunchPalette = () => {
    const event = new KeyboardEvent("keydown", {
      ctrlKey: true,
      key: "k",
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  // Smart Detection Engine Logic
  const detectInputFormats = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return [];

    const detections = [];

    // 1. JSON Check
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        JSON.parse(trimmed);
        detections.push({
          type: "json",
          name: "Valid JSON Structure",
          icon: "Braces",
          description: "Properly structured JSON format validated client-side.",
          actions: [
            { label: "Format & Validate", href: "/tools/json-formatter", icon: "Braces" },
            { label: "Convert to CSV Grid", href: "/tools/csv-json-converter", icon: "Shuffle" },
          ],
        });
      } catch {
        detections.push({
          type: "json-invalid",
          name: "Malformed JSON Structure",
          icon: "Braces",
          description: "Syntactically invalid JSON structure. Check quotes and commas.",
          actions: [
            { label: "Inspect & Repair JSON", href: "/tools/json-formatter", icon: "Braces" },
          ],
        });
      }
    }

    // 2. JWT Check
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_/=+]*$/;
    if (jwtRegex.test(trimmed)) {
      detections.push({
        type: "jwt",
        name: "JSON Web Token (JWT)",
        icon: "ShieldAlert",
        description: "Standard encoded base64url web token containing payload & signature claims.",
        actions: [
          { label: "Decode & Inspect Claims", href: "/tools/jwt-decoder", icon: "ShieldAlert" },
        ],
      });
    }

    // 3. Base64 Check
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    if (
      trimmed.length >= 8 &&
      !trimmed.includes(" ") &&
      !trimmed.includes(".") &&
      !trimmed.includes("-") &&
      base64Regex.test(trimmed)
    ) {
      detections.push({
        type: "base64",
        name: "Base64 Alphanumeric String",
        icon: "Key",
        description: "Detected binary-to-text base64 string block.",
        actions: [
          { label: "Decode Base64 Data", href: "/tools/base64-decoder", icon: "FileText" },
        ],
      });
    }

    // 4. IPv4 / CIDR Subnet
    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(3[0-2]|[12]?[0-9]))?$/;
    if (ipRegex.test(trimmed)) {
      detections.push({
        type: "subnet",
        name: "IPv4 Host Address / Range",
        icon: "Binary",
        description: "IPv4 formatting matching CIDR mask boundaries.",
        actions: [
          { label: "Calculate Subnet Splits", href: "/tools/subnet-calculator", icon: "Binary" },
        ],
      });
    }

    // 5. UUID / GUID String
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (uuidRegex.test(trimmed)) {
      detections.push({
        type: "uuid",
        name: "Standard UUID / GUID",
        icon: "Fingerprint",
        description: "Validated RFC 4122 compliant unique string identifier.",
        actions: [
          { label: "Inspect UUID Parameters", href: "/tools/uuid-generator", icon: "Fingerprint" },
        ],
      });
    }

    // 6. Stack Trace check
    const hasStackTraceKeywords =
      trimmed.includes("at ") ||
      trimmed.includes("Exception") ||
      trimmed.includes("Traceback") ||
      trimmed.includes("TypeError") ||
      trimmed.includes("ReferenceError") ||
      trimmed.includes("SyntaxError");
    if (hasStackTraceKeywords && trimmed.split("\n").length >= 2) {
      detections.push({
        type: "error",
        name: "Compiler Stack Trace / Logs",
        icon: "Terminal",
        description: "System traceback output detected. Run AI compiler diagnostics.",
        actions: [
          { label: "Translate & Debug (AI)", href: "/tools/error-translator", icon: "Sparkles" },
          { label: "Compare Logs (Diff Check)", href: "/tools/diff-checker", icon: "Terminal" },
        ],
      });
    }

    // 7. GitHub Repository check
    if (trimmed.includes("github.com/")) {
      detections.push({
        type: "github",
        name: "GitHub Repository Link",
        icon: "Terminal",
        description: "Remote code repository URL detected. Parse via AI auditor.",
        actions: [
          { label: "Audit GitHub Repo (AI)", href: "/tools/github-analyzer", icon: "Sparkles" },
        ],
      });
    }

    // 8. Project Idea check
    const hasProjectKeywords =
      trimmed.toLowerCase().includes("build") ||
      trimmed.toLowerCase().includes("project") ||
      trimmed.toLowerCase().includes("app") ||
      trimmed.toLowerCase().includes("idea") ||
      trimmed.toLowerCase().includes("startup") ||
      trimmed.toLowerCase().includes("saas") ||
      trimmed.toLowerCase().includes("develop");
    if (hasProjectKeywords && trimmed.length >= 20) {
      detections.push({
        type: "project",
        name: "Project / Startup Concept",
        icon: "Sparkles",
        description: "Looks like a side-project or startup idea description. Run AI validator.",
        actions: [
          { label: "Validate Project (AI)", href: "/tools/project-validator", icon: "Sparkles" },
        ],
      });
    }

    // Default Fallback
    if (detections.length === 0 && trimmed.length > 0) {
      detections.push({
        type: "general",
        name: "Raw String / Code Block",
        icon: "Terminal",
        description: "Undifferentiated text context. Run standard diagnostics or simulator.",
        actions: [
          { label: "Compare Texts (Diff Check)", href: "/tools/diff-checker", icon: "Terminal" },
          { label: "Evaluate in Interview (AI)", href: "/tools/interview-simulator", icon: "Sparkles" },
        ],
      });
    }

    return detections;
  };

  const currentDetections = detectInputFormats(sandboxText);

  // Navigate tool with transfer payload
  const handleActionClick = (href: string) => {
    if (sandboxText.trim()) {
      sessionStorage.setItem("sandbox_transfer_input", sandboxText);
    }
    router.push(href);
  };

  // Sidebar tool filtering
  const explorerCategories = CATEGORIES.map((cat) => {
    const catTools = TOOLS.filter((tool) => {
      if (tool.category !== cat.id) return false;
      const matchesSearch =
        tool.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
        tool.description.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
        tool.keywords.some((kw) => kw.toLowerCase().includes(sidebarSearch.toLowerCase()));

      const matchesImplemented = !showOnlyImplemented || isToolImplemented(tool.id);
      return matchesSearch && matchesImplemented;
    });
    return { ...cat, tools: catTools };
  }).filter((cat) => cat.tools.length > 0);

  // Terminal submission logic
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = terminalInput.trim();
    if (!rawCmd) return;

    const newLogs = [...terminalLogs, { type: "input" as const, text: rawCmd }];
    const parts = rawCmd.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputText = "";

    switch (command) {
      case "help":
        outputText = `Available Scripts:
  list                 - List all developer tools in the registry.
  goto <tool-id>       - Navigate to a tool (e.g. goto json).
  clear                - Clear console history logs.
  theme                - Toggle dashboard appearance (light/dark).
  api                  - Set up local Gemini API credentials modal.
  sandbox "<text>"     - Load custom string values into sandbox.
  json / base64 / jwt  - Direct tool navigation shortcuts.`;
        break;

      case "list":
        outputText = `DevToolBox Active Registry:
=============================================
  ID                NAME
=============================================
  json              JSON Formatter & Validator
  base64            Base64 Encoder / Decoder
  password          Secure Password Generator
  csv               CSV / JSON Converter
  tailwind          Tailwind Layout Designer
  crypto            RSA & AES Encryption Sandbox
  subnet            IPv4 Subnet Calculator
  diff              Visual Diff Checker
  jwt               JWT Decoder
  uuid              UUID / GUID Generator
  http              HTTP Status Code Explorer
  error             AI Error Translator
  github            AI GitHub Repo Analyzer
  interview         AI Interview Simulator
  project           AI Project Idea Validator`;
        break;

      case "clear":
        setTerminalLogs([]);
        setTerminalInput("");
        return;

      case "theme":
        const isDarkNow = document.documentElement.classList.contains("dark");
        if (isDarkNow) {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("theme", "light");
          outputText = "Appearance theme switched to LIGHT mode.";
        } else {
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
          outputText = "Appearance theme switched to DARK mode.";
        }
        window.dispatchEvent(new Event("theme-updated"));
        break;

      case "api":
        window.dispatchEvent(new Event("open-api-key-modal"));
        outputText = "Triggered API settings configuration modal.";
        break;

      case "sandbox":
        const textToLoad = args.join(" ").replace(/^["']|["']$/g, "");
        if (textToLoad) {
          setSandboxText(textToLoad);
          outputText = `Loaded payload into sandbox (${textToLoad.length} chars).`;
        } else {
          outputText = "Syntax error: sandbox command expects argument e.g. sandbox \"payload\"";
        }
        break;

      case "json":
      case "goto":
        const target = command === "goto" ? args[0]?.toLowerCase() : command;
        const toolMap: Record<string, string> = {
          json: "/tools/json-formatter",
          base64: "/tools/base64-decoder",
          password: "/tools/password-generator",
          csv: "/tools/csv-json-converter",
          tailwind: "/tools/tailwind-playground",
          crypto: "/tools/crypto-sandbox",
          subnet: "/tools/subnet-calculator",
          diff: "/tools/diff-checker",
          jwt: "/tools/jwt-decoder",
          uuid: "/tools/uuid-generator",
          http: "/tools/http-status",
          error: "/tools/error-translator",
          github: "/tools/github-analyzer",
          interview: "/tools/interview-simulator",
          project: "/tools/project-validator",
        };

        const href = toolMap[target];
        if (href) {
          if (sandboxText.trim()) {
            sessionStorage.setItem("sandbox_transfer_input", sandboxText);
          }
          outputText = `Routing console instance to tool path [${href}]...`;
          setTerminalLogs([...newLogs, { type: "output", text: outputText }]);
          setTerminalInput("");
          setTimeout(() => {
            router.push(href);
          }, 400);
          return;
        } else {
          outputText = `Tool ID '${target}' not found. Type 'list' to view valid IDs.`;
        }
        break;

      case "base64":
      case "password":
      case "csv":
      case "tailwind":
      case "crypto":
      case "subnet":
      case "diff":
      case "jwt":
      case "uuid":
      case "http":
      case "error":
      case "github":
      case "interview":
      case "project":
        const directHref = {
          base64: "/tools/base64-decoder",
          password: "/tools/password-generator",
          csv: "/tools/csv-json-converter",
          tailwind: "/tools/tailwind-playground",
          crypto: "/tools/crypto-sandbox",
          subnet: "/tools/subnet-calculator",
          diff: "/tools/diff-checker",
          jwt: "/tools/jwt-decoder",
          uuid: "/tools/uuid-generator",
          http: "/tools/http-status",
          error: "/tools/error-translator",
          github: "/tools/github-analyzer",
          interview: "/tools/interview-simulator",
          project: "/tools/project-validator",
        }[command];
        if (directHref) {
          if (sandboxText.trim()) {
            sessionStorage.setItem("sandbox_transfer_input", sandboxText);
          }
          outputText = `Routing console instance to tool path [${directHref}]...`;
          setTerminalLogs([...newLogs, { type: "output", text: outputText }]);
          setTerminalInput("");
          setTimeout(() => {
            router.push(directHref);
          }, 400);
          return;
        }
        break;

      default:
        outputText = `Command '${command}' not recognized. Type 'help' to show valid command scripts.`;
        break;
    }

    setTerminalLogs([...newLogs, { type: "output" as const, text: outputText }]);
    setTerminalInput("");
  };

  // Traditional tools list filtering
  const filteredCatalogTools = TOOLS.filter((tool) => {
    const matchesCategory =
      selectedCatalogCategory === "all" || tool.category === selectedCatalogCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      tool.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      tool.keywords.some((kw) => kw.toLowerCase().includes(catalogSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 space-y-16 pb-20 pt-6">
      {/* Mesh Glow Background Details */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] left-0 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Welcome Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/80 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Icon name="Sparkles" className="w-3.5 h-3.5 animate-pulse" />
              <span>Universal Command Center</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight sm:text-4xl">
              Developer Intelligence Console
            </h1>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Sandbox execution, real-time context analysis, and AI developer utilities. Zero server trace logging.
            </p>
          </div>

          <div className="flex flex-wrap gap-3.5">
            <button
              onClick={handleLaunchPalette}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg border border-input bg-card hover:bg-muted text-xs font-semibold text-foreground cursor-pointer shadow-sm transition-all"
            >
              <Icon name="Search" className="w-4 h-4 text-muted-foreground" />
              <span>Command Palette</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-muted border border-border rounded text-muted-foreground">
                Ctrl+K
              </kbd>
            </button>
            <button
              onClick={() => window.dispatchEvent(new Event("open-api-key-modal"))}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg border border-input bg-card hover:bg-muted text-xs font-semibold text-foreground cursor-pointer shadow-sm transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${hasApiKey ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/35"}`} />
              <span>Gemini Key: {hasApiKey ? "Configured" : "Not Set"}</span>
            </button>
          </div>
        </div>

        {/* Mobile View Tab Selector */}
        <div className="flex lg:hidden rounded-lg border border-input p-0.5 bg-background">
          <button
            onClick={() => setActiveTab("workspace")}
            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === "workspace"
                ? "bg-secondary text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Universal Sandbox
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === "tools"
                ? "bg-secondary text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Workspace Explorer ({TOOLS.length})
          </button>
        </div>

        {/* IDE Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT PANEL: Workspace Explorer Directory */}
          <div className={`${activeTab === "tools" ? "block" : "hidden"} lg:block lg:col-span-1 space-y-4`}>
            <div className="rounded-xl border border-border bg-card/40 backdrop-blur-md overflow-hidden flex flex-col h-[650px] shadow-sm">
              <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                  <Icon name="Compass" className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  <span>Workspace Explorer</span>
                </span>
                <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  {TOOLS.length} items
                </span>
              </div>

              {/* Sidebar Filters */}
              <div className="p-3 border-b border-border/60 space-y-2.5">
                <div className="relative">
                  <Icon name="Search" className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground/60" />
                  <input
                    type="text"
                    placeholder="Search tree..."
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                  {sidebarSearch && (
                    <button
                      onClick={() => setSidebarSearch("")}
                      className="absolute right-2 top-2 p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name="X" className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showOnlyImplemented}
                    onChange={(e) => setShowOnlyImplemented(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-0 w-3 h-3 cursor-pointer bg-background"
                  />
                  <span className="text-[10px] font-medium text-muted-foreground">Hide incomplete tools</span>
                </label>
              </div>

              {/* Explorer File Tree */}
              <div className="flex-grow overflow-y-auto p-2.5 space-y-4 scrollbar-thin">
                {explorerCategories.length > 0 ? (
                  explorerCategories.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-1 py-0.5">
                        <Icon name={cat.icon} className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                        <span>{cat.name}</span>
                      </div>
                      <div className="border-l border-border/60 ml-2.5 pl-2 space-y-0.5">
                        {cat.tools.map((tool) => {
                          const active = isToolImplemented(tool.id);
                          return active ? (
                            <Link
                              key={tool.id}
                              href={tool.href}
                              onClick={() => {
                                if (sandboxText.trim()) {
                                  sessionStorage.setItem("sandbox_transfer_input", sandboxText);
                                }
                              }}
                              className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-secondary/45 text-xs transition-colors text-foreground"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <Icon name={tool.icon} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                                <span className="truncate group-hover:text-primary transition-colors">{tool.name}</span>
                              </div>
                              {tool.category === "ai" && (
                                <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1 rounded shrink-0 leading-normal border border-emerald-500/10 uppercase">
                                  AI
                                </span>
                              )}
                            </Link>
                          ) : (
                            <div
                              key={tool.id}
                              className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground/50 select-none"
                              title="Under active development"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <Icon name="Lock" className="w-3 h-3 text-muted-foreground/30 shrink-0" />
                                <span className="truncate">{tool.name}</span>
                              </div>
                              <span className="text-[8px] font-bold text-muted-foreground bg-secondary px-1 rounded shrink-0 uppercase">
                                Soon
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-xs text-muted-foreground/60">
                    No registry nodes found matching filter.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Universal sandbox, Detection grid & Command terminal */}
          <div className={`${activeTab === "workspace" ? "block" : "hidden"} lg:block lg:col-span-3 space-y-6`}>
            
            {/* Console Section */}
            <Card className="border-border bg-card/30 backdrop-blur-md overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center text-foreground">
                  <Icon name="Terminal" className="w-4 h-4 mr-2 text-primary" />
                  <span>Universal Sandbox Input</span>
                </span>
                
                {/* Samples loader */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground self-center mr-1">Load Demo:</span>
                  <button
                    onClick={() => setSandboxText(SAMPLES.json)}
                    className="px-2 py-1 bg-secondary hover:bg-muted border border-border rounded text-[10px] font-semibold text-foreground cursor-pointer transition-colors"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => setSandboxText(SAMPLES.jwt)}
                    className="px-2 py-1 bg-secondary hover:bg-muted border border-border rounded text-[10px] font-semibold text-foreground cursor-pointer transition-colors"
                  >
                    JWT
                  </button>
                  <button
                    onClick={() => setSandboxText(SAMPLES.error)}
                    className="px-2 py-1 bg-secondary hover:bg-muted border border-border rounded text-[10px] font-semibold text-foreground cursor-pointer transition-colors"
                  >
                    Stack Trace
                  </button>
                  <button
                    onClick={() => setSandboxText(SAMPLES.ip)}
                    className="px-2 py-1 bg-secondary hover:bg-muted border border-border rounded text-[10px] font-semibold text-foreground cursor-pointer transition-colors"
                  >
                    Subnet IP
                  </button>
                  <button
                    onClick={() => setSandboxText(SAMPLES.uuid)}
                    className="px-2 py-1 bg-secondary hover:bg-muted border border-border rounded text-[10px] font-semibold text-foreground cursor-pointer transition-colors"
                  >
                    UUID
                  </button>
                </div>
              </div>

              {/* Textarea sandbox block */}
              <CardContent className="p-0 relative">
                <textarea
                  placeholder="Paste or write sandbox parameters here (JSON, Base64, stack traces, JWTs, subnet IPs, github repo URL)..."
                  value={sandboxText}
                  onChange={(e) => setSandboxText(e.target.value)}
                  className="w-full h-56 border-0 focus:outline-none focus:ring-0 p-4 font-mono text-xs overflow-auto resize-none bg-black/40 text-foreground placeholder:text-muted-foreground/50 border-b border-border/50 select-text"
                />
                <div className="flex items-center justify-between p-3.5 bg-muted/5 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    <span>{sandboxText.length} characters</span>
                    <span>•</span>
                    <span>{sandboxText.split("\n").filter(Boolean).length} lines</span>
                  </div>
                  {sandboxText && (
                    <button
                      onClick={() => setSandboxText("")}
                      className="text-xs font-semibold text-destructive hover:underline flex items-center cursor-pointer"
                    >
                      <Icon name="Trash" className="w-3.5 h-3.5 mr-1" />
                      <span>Clear Sandbox</span>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Smart Detection Engine Panel */}
            <Card className="border-border bg-card/20 backdrop-blur-md overflow-hidden">
              <div className="px-4 py-3 border-b border-border/60 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Smart Detection Matrix
                  </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground italic">
                  Analyzes inputs client-side
                </span>
              </div>
              <CardContent className="p-5 space-y-4">
                {currentDetections.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-emerald-500 flex items-center space-x-1">
                      <Icon name="Check" className="w-4 h-4" />
                      <span>Input Format Signatures Identified:</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentDetections.map((det, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-border/80 bg-card/65 flex flex-col justify-between space-y-3.5 shadow-sm"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Icon name={det.icon} className="w-4 h-4" />
                              </div>
                              <h4 className="text-xs font-bold text-foreground">{det.name}</h4>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {det.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {det.actions.map((act, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleActionClick(act.href)}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary/95 text-[10px] font-bold text-primary-foreground rounded-lg cursor-pointer transition-colors shadow-sm"
                              >
                                <Icon name={act.icon} className="w-3 h-3" />
                                <span>{act.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground/35">
                      <Icon name="Compass" className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground">Sandbox Empty or Unparsed</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        Type or paste payloads into the sandbox console above. The engine automatically scans structure headers and offers direct pipeline routing.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interactive Terminal command palette */}
            <Card className="border-border bg-black/90 shadow-2xl rounded-xl overflow-hidden font-mono text-xs">
              <div className="px-4 py-2 border-b border-border/40 bg-zinc-900/90 text-zinc-400 flex items-center justify-between select-none">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[10px] font-bold text-zinc-500 ml-2">toolbox@console:~</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTerminalLogs([{ type: "output", text: "Console history cleared." }])}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Clear history"
                  >
                    <Icon name="Trash" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Terminal Logs Viewport */}
              <div className="p-4 h-56 overflow-y-auto space-y-2 select-text leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800">
                {terminalLogs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap">
                    {log.type === "input" ? (
                      <div className="flex text-zinc-300">
                        <span className="text-emerald-500 mr-2">toolbox@console:~$</span>
                        <span>{log.text}</span>
                      </div>
                    ) : (
                      <div className="text-zinc-400 pl-4">{log.text}</div>
                    )}
                  </div>
                ))}
                <div ref={terminalBottomRef} />
              </div>

              {/* Console Input Bar */}
              <form
                onSubmit={handleTerminalSubmit}
                className="flex items-center px-4 py-2.5 bg-zinc-950/80 border-t border-border/30"
              >
                <span className="text-emerald-500 font-bold mr-2 select-none">toolbox@console:~$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Type 'help' or tool shortcuts (e.g. 'json', 'jwt')..."
                  className="flex-1 bg-transparent text-zinc-200 focus:outline-none font-mono text-xs placeholder:text-zinc-600/80"
                />
                <button
                  type="submit"
                  className="px-2 py-0.5 border border-zinc-700 bg-zinc-800 text-[10px] rounded text-zinc-400 hover:bg-zinc-700 cursor-pointer font-bold"
                >
                  RUN
                </button>
              </form>

              {/* Command suggestions bar */}
              <div className="px-4 py-2 bg-zinc-950/40 border-t border-zinc-900/60 flex flex-wrap items-center gap-1.5 select-none text-[10px] text-zinc-500">
                <span>Shortcuts:</span>
                {(["help", "list", "json", "jwt", "base64", "uuid", "api"] as const).map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => {
                      setTerminalInput(cmd);
                    }}
                    className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors hover:border-zinc-700 cursor-pointer"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Traditional Tools Library Catalog Grid (Retained at the bottom) */}
        <section id="catalog" className="border-t border-border/80 pt-16 mt-16 space-y-8 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                All Available Utility Libraries
              </h3>
              <p className="text-xs text-muted-foreground">
                Browse, search, or filter the full client-side tool library.
              </p>
            </div>

            {/* Catalog search and category tab filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative max-w-xs">
                <Icon name="Search" className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter cards..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full sm:w-56 h-9 pl-9 pr-3 text-xs bg-card border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <select
                value={selectedCatalogCategory}
                onChange={(e) => setSelectedCatalogCategory(e.target.value as any)}
                className="h-9 px-3 border border-input rounded-lg bg-card text-xs focus:outline-none text-foreground"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredCatalogTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogTools.map((tool) => {
                const active = isToolImplemented(tool.id);
                return (
                  <div
                    key={tool.id}
                    className={`group relative rounded-xl border bg-card shadow-sm premium-card-hover transition-all duration-300 ${
                      active ? "border-primary/10" : "opacity-60 border-border"
                    }`}
                  >
                    <div className="p-6 flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm">
                            <Icon
                              name={tool.icon}
                              className="w-5 h-5 transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          {tool.isPopular && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                              Popular
                            </span>
                          )}
                          {!active && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                              Soon
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {tool.name}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                      </div>

                      <div>
                        {active ? (
                          <button
                            onClick={() => handleActionClick(tool.href)}
                            className="inline-flex items-center text-xs font-semibold text-primary hover:underline cursor-pointer"
                          >
                            <span>Open Utility</span>
                            <Icon
                              name="ArrowRight"
                              className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1"
                            />
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 font-medium flex items-center">
                            <Icon name="Lock" className="w-3 h-3 mr-1" /> Available soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="text-center p-12 max-w-md mx-auto">
              <CardContent className="space-y-4 flex flex-col items-center">
                <Icon name="Info" className="w-10 h-10 text-muted-foreground/30" />
                <h4 className="text-base font-bold">No matches found</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We couldn't find any tool matching your criteria. Try adjusting your search query.
                </p>
                <button
                  onClick={() => {
                    setCatalogSearch("");
                    setSelectedCatalogCategory("all");
                  }}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* Categories Info section */}
      <section id="categories" className="bg-secondary/15 py-16 border-y border-border scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              Segmented Development Workspace
            </h3>
            <p className="text-xs text-muted-foreground">
              A comprehensive utility suite categorized to fit different development and academic workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((category) => (
              <div
                key={category.id}
                onClick={() => {
                  setSelectedCatalogCategory(category.id);
                  const catalogElement = document.getElementById("catalog");
                  catalogElement?.scrollIntoView({ behavior: "smooth" });
                }}
                className="p-6 rounded-xl border border-border bg-card shadow-sm premium-card-hover cursor-pointer space-y-3 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <Icon name={category.icon} className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Frequently Asked Questions */}
      <section id="faqs" className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12 scroll-mt-20">
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-muted-foreground">
            Everything you need to know about safety, pricing, and how the platform operates.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">{faq.question}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
