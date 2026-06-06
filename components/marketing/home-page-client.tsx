"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { TOOLS, CATEGORIES, FAQS } from "@/lib/tools-data";
import { ToolCategory } from "@/types";

const SAMPLES = {
  json: `{\n  "projectName": "DevToolBox",\n  "version": 2.0,\n  "developer": "Alice",\n  "config": {\n    "status": "active",\n    "offlineFirst": true\n  },\n  "modules": ["sandbox", "palette", "detector"]\n}`,
  base64: "SGVsbG8gRGV2ZWxvcGVyISBXZWxjb21lIHRvIERldlRvb2xCb3ggVW5pdmVyc2FsIFNhbmRib3gu",
  jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.signature_placeholder",
  ip: "192.168.1.1/24",
  error: `TypeError: Cannot read properties of undefined (reading 'map')\n  at HomePageClient (home-page-client.tsx:215:30)\n  at renderWithHooks (react-dom.development.js:15486:18)\n  at mountIndeterminateComponent (react-dom.development.js:20103:13)\n  at beginWork (react-dom.development.js:21626:16)`,
  uuid: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
  github: "https://github.com/facebook/react",
};

const DETECTION_TYPE_CONFIG: Record<string, { color: string; badge: string; badgeClass: string }> = {
  json:        { color: "text-signal",      badge: "JSON",    badgeClass: "signal-badge-green" },
  "json-invalid": { color: "text-destructive", badge: "ERR",  badgeClass: "signal-badge-amber" },
  jwt:         { color: "text-intel",       badge: "JWT",     badgeClass: "signal-badge-blue" },
  base64:      { color: "text-signal",      badge: "B64",     badgeClass: "signal-badge-green" },
  subnet:      { color: "text-intel",       badge: "IPV4",    badgeClass: "signal-badge-blue" },
  uuid:        { color: "text-muted-foreground", badge: "UUID", badgeClass: "signal-badge-muted" },
  error:       { color: "text-destructive", badge: "TRACE",   badgeClass: "signal-badge-amber" },
  github:      { color: "text-intel",       badge: "REPO",    badgeClass: "signal-badge-blue" },
  project:     { color: "text-signal",      badge: "IDEA",    badgeClass: "signal-badge-green" },
  general:     { color: "text-muted-foreground", badge: "STR", badgeClass: "signal-badge-muted" },
};

export function HomePageClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"workspace" | "tools" | "insight">("workspace");
  const [sandboxText, setSandboxText] = useState("");
  const [sandboxFocused, setSandboxFocused] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [showOnlyImplemented, setShowOnlyImplemented] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<ToolCategory | "all">("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const [terminalLogs, setTerminalLogs] = useState<Array<{ type: "input" | "output"; text: string }>>([
    { type: "output", text: "DevToolBox Intelligence Command Line [Version 2.1.0]" },
    { type: "output", text: "(c) 2026 DevToolBox. Standard sandbox terminal interface." },
    { type: "output", text: "Type 'help' to display list of executable scripts." },
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    setHasApiKey(!!savedKey);
    const handleKeyUpdate = () => setHasApiKey(!!localStorage.getItem("gemini_api_key"));
    window.addEventListener("api-key-updated", handleKeyUpdate);
    return () => window.removeEventListener("api-key-updated", handleKeyUpdate);
  }, []);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        const timer = setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 150);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const isToolImplemented = (id: string) =>
    ["json-formatter","base64-decoder","password-generator","csv-json-converter","tailwind-playground","crypto-sandbox","subnet-calculator","diff-checker","error-translator","jwt-decoder","uuid-generator","http-status-explorer","github-analyzer","interview-simulator","project-validator"].includes(id);

  const handleLaunchPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { ctrlKey: true, key: "k", bubbles: true, cancelable: true }));
  };

  // Smart Detection Engine
  const detectInputFormats = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return [];
    const detections = [];

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        JSON.parse(trimmed);
        detections.push({ type: "json", name: "Valid JSON Structure", icon: "Braces", description: "Properly structured JSON format validated client-side.", actions: [{ label: "Format & Validate", href: "/tools/json-formatter", icon: "Braces" }, { label: "Convert to CSV Grid", href: "/tools/csv-json-converter", icon: "Shuffle" }] });
      } catch {
        detections.push({ type: "json-invalid", name: "Malformed JSON", icon: "Braces", description: "Syntactically invalid JSON structure. Check quotes and commas.", actions: [{ label: "Inspect & Repair", href: "/tools/json-formatter", icon: "Braces" }] });
      }
    }

    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_/=+]*$/;
    if (jwtRegex.test(trimmed)) {
      detections.push({ type: "jwt", name: "JSON Web Token (JWT)", icon: "ShieldAlert", description: "Standard encoded base64url web token containing payload & signature claims.", actions: [{ label: "Decode & Inspect Claims", href: "/tools/jwt-decoder", icon: "ShieldAlert" }] });
    }

    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    if (trimmed.length >= 8 && !trimmed.includes(" ") && !trimmed.includes(".") && !trimmed.includes("-") && base64Regex.test(trimmed)) {
      detections.push({ type: "base64", name: "Base64 String", icon: "Key", description: "Detected binary-to-text base64 encoded block.", actions: [{ label: "Decode Base64 Data", href: "/tools/base64-decoder", icon: "FileText" }] });
    }

    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(3[0-2]|[12]?[0-9]))?$/;
    if (ipRegex.test(trimmed)) {
      detections.push({ type: "subnet", name: "IPv4 Host / CIDR Range", icon: "Binary", description: "IPv4 formatting matching CIDR mask boundaries.", actions: [{ label: "Calculate Subnet Splits", href: "/tools/subnet-calculator", icon: "Binary" }] });
    }

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (uuidRegex.test(trimmed)) {
      detections.push({ type: "uuid", name: "RFC 4122 UUID / GUID", icon: "Fingerprint", description: "Validated RFC 4122 compliant unique string identifier.", actions: [{ label: "Inspect UUID Parameters", href: "/tools/uuid-generator", icon: "Fingerprint" }] });
    }

    const hasStackTrace = trimmed.includes("at ") || trimmed.includes("Exception") || trimmed.includes("Traceback") || trimmed.includes("TypeError") || trimmed.includes("ReferenceError") || trimmed.includes("SyntaxError");
    if (hasStackTrace && trimmed.split("\n").length >= 2) {
      detections.push({ type: "error", name: "Stack Trace / Compiler Log", icon: "Terminal", description: "System traceback output detected. Run AI compiler diagnostics.", actions: [{ label: "Translate & Debug (AI)", href: "/tools/error-translator", icon: "Sparkles" }, { label: "Compare Logs (Diff)", href: "/tools/diff-checker", icon: "Terminal" }] });
    }

    if (trimmed.includes("github.com/")) {
      detections.push({ type: "github", name: "GitHub Repository URL", icon: "Terminal", description: "Remote code repository URL detected. Parse via AI auditor.", actions: [{ label: "Audit GitHub Repo (AI)", href: "/tools/github-analyzer", icon: "Sparkles" }] });
    }

    const projectKeywords = ["build","project","app","idea","startup","saas","develop"];
    if (projectKeywords.some((kw) => trimmed.toLowerCase().includes(kw)) && trimmed.length >= 20) {
      detections.push({ type: "project", name: "Project / Startup Concept", icon: "Sparkles", description: "Looks like a side-project or startup idea description.", actions: [{ label: "Validate Project (AI)", href: "/tools/project-validator", icon: "Sparkles" }] });
    }

    if (detections.length === 0 && trimmed.length > 0) {
      detections.push({ type: "general", name: "Raw String / Code Block", icon: "Terminal", description: "Undifferentiated text. Run standard diagnostics or diff comparison.", actions: [{ label: "Compare Texts (Diff)", href: "/tools/diff-checker", icon: "Terminal" }, { label: "Evaluate in Interview (AI)", href: "/tools/interview-simulator", icon: "Sparkles" }] });
    }
    return detections;
  };

  const currentDetections = detectInputFormats(sandboxText);

  const handleActionClick = (href: string) => {
    if (sandboxText.trim()) sessionStorage.setItem("sandbox_transfer_input", sandboxText);
    router.push(href);
  };

  // Command Rail filtering
  const explorerCategories = CATEGORIES.map((cat) => {
    const catTools = TOOLS.filter((tool) => {
      if (tool.category !== cat.id) return false;
      const matchesSearch = tool.name.toLowerCase().includes(sidebarSearch.toLowerCase()) || tool.description.toLowerCase().includes(sidebarSearch.toLowerCase()) || tool.keywords.some((kw) => kw.toLowerCase().includes(sidebarSearch.toLowerCase()));
      return matchesSearch && (!showOnlyImplemented || isToolImplemented(tool.id));
    });
    return { ...cat, tools: catTools };
  }).filter((cat) => cat.tools.length > 0);

  // Terminal
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
        outputText = `Available Scripts:\n  list                 - List all developer tools in the registry.\n  goto <tool-id>       - Navigate to a tool (e.g. goto json).\n  clear                - Clear console history logs.\n  theme                - Toggle dashboard appearance (light/dark).\n  api                  - Set up local Gemini API credentials modal.\n  sandbox "<text>"     - Load custom string values into sandbox.\n  json / base64 / jwt  - Direct tool navigation shortcuts.`;
        break;
      case "list":
        outputText = `DevToolBox Active Registry:\n=============================================\n  ID                NAME\n=============================================\n  json              JSON Formatter & Validator\n  base64            Base64 Encoder / Decoder\n  password          Secure Password Generator\n  csv               CSV / JSON Converter\n  tailwind          Tailwind Layout Designer\n  crypto            RSA & AES Encryption Sandbox\n  subnet            IPv4 Subnet Calculator\n  diff              Visual Diff Checker\n  jwt               JWT Decoder\n  uuid              UUID / GUID Generator\n  http              HTTP Status Code Explorer\n  error             AI Error Translator\n  github            AI GitHub Repo Analyzer\n  interview         AI Interview Simulator\n  project           AI Project Idea Validator`;
        break;
      case "clear":
        setTerminalLogs([]);
        setTerminalInput("");
        return;
      case "theme":
        const isDarkNow = document.documentElement.classList.contains("dark");
        if (isDarkNow) { document.documentElement.classList.remove("dark"); localStorage.setItem("theme", "light"); outputText = "Appearance theme switched to LIGHT mode."; }
        else { document.documentElement.classList.add("dark"); localStorage.setItem("theme", "dark"); outputText = "Appearance theme switched to DARK mode."; }
        window.dispatchEvent(new Event("theme-updated"));
        break;
      case "api":
        window.dispatchEvent(new Event("open-api-key-modal"));
        outputText = "Triggered API settings configuration modal.";
        break;
      case "sandbox":
        const textToLoad = args.join(" ").replace(/^["']|["']$/g, "");
        if (textToLoad) { setSandboxText(textToLoad); outputText = `Loaded payload into sandbox (${textToLoad.length} chars).`; }
        else { outputText = "Syntax error: sandbox command expects argument e.g. sandbox \"payload\""; }
        break;
      case "json": case "base64": case "password": case "csv": case "tailwind": case "crypto": case "subnet": case "diff": case "jwt": case "uuid": case "http": case "error": case "github": case "interview": case "project": {
        const directHref: Record<string, string> = { json: "/tools/json-formatter", base64: "/tools/base64-decoder", password: "/tools/password-generator", csv: "/tools/csv-json-converter", tailwind: "/tools/tailwind-playground", crypto: "/tools/crypto-sandbox", subnet: "/tools/subnet-calculator", diff: "/tools/diff-checker", jwt: "/tools/jwt-decoder", uuid: "/tools/uuid-generator", http: "/tools/http-status", error: "/tools/error-translator", github: "/tools/github-analyzer", interview: "/tools/interview-simulator", project: "/tools/project-validator" };
        const h = directHref[command];
        if (h) { if (sandboxText.trim()) sessionStorage.setItem("sandbox_transfer_input", sandboxText); outputText = `Routing console instance to tool path [${h}]...`; setTerminalLogs([...newLogs, { type: "output", text: outputText }]); setTerminalInput(""); setTimeout(() => router.push(h), 400); return; }
        break;
      }
      case "goto": {
        const target = args[0]?.toLowerCase();
        const toolMap: Record<string, string> = { json: "/tools/json-formatter", base64: "/tools/base64-decoder", password: "/tools/password-generator", csv: "/tools/csv-json-converter", tailwind: "/tools/tailwind-playground", crypto: "/tools/crypto-sandbox", subnet: "/tools/subnet-calculator", diff: "/tools/diff-checker", jwt: "/tools/jwt-decoder", uuid: "/tools/uuid-generator", http: "/tools/http-status", error: "/tools/error-translator", github: "/tools/github-analyzer", interview: "/tools/interview-simulator", project: "/tools/project-validator" };
        const h = toolMap[target];
        if (h) { if (sandboxText.trim()) sessionStorage.setItem("sandbox_transfer_input", sandboxText); outputText = `Routing console instance to tool path [${h}]...`; setTerminalLogs([...newLogs, { type: "output", text: outputText }]); setTerminalInput(""); setTimeout(() => router.push(h), 400); return; }
        else outputText = `Tool ID '${target}' not found. Type 'list' to view valid IDs.`;
        break;
      }
      default:
        outputText = `Command '${command}' not recognized. Type 'help' to show valid command scripts.`;
    }
    setTerminalLogs([...newLogs, { type: "output" as const, text: outputText }]);
    setTerminalInput("");
  };

  // Catalog filter
  const filteredCatalogTools = TOOLS.filter((tool) => {
    const matchesCategory = selectedCatalogCategory === "all" || tool.category === selectedCatalogCategory;
    const matchesSearch = tool.name.toLowerCase().includes(catalogSearch.toLowerCase()) || tool.description.toLowerCase().includes(catalogSearch.toLowerCase()) || tool.keywords.some((kw) => kw.toLowerCase().includes(catalogSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const liveToolCount = TOOLS.filter((t) => isToolImplemented(t.id)).length;

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">

      {/* ═══════════════════════════════════════════════════════════
          AMBIENT BACKGROUND — Grid crosshatch + depth glows
          ═══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 grid-crosshatch opacity-40 pointer-events-none" />
      <div className="absolute inset-0 ambient-glow-green pointer-events-none" />
      <div className="absolute inset-0 ambient-glow-blue pointer-events-none" />

      {/* ═══════════════════════════════════════════════════════════
          WORKSPACE IDENTITY STRIP — Replaces the old hero section
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative z-10 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="signal-badge signal-badge-green">Intelligence Workspace</span>
                <span className="signal-badge signal-badge-blue">v2.1</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-foreground leading-tight">
                Developer Intelligence Command Center
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Paste anything — sandbox detects, analyzes, and routes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="workspace-palette-btn"
              onClick={handleLaunchPalette}
              className="op-btn op-btn-ghost"
            >
              <Icon name="Search" className="w-3.5 h-3.5" />
              <span>Palette</span>
              <kbd className="hidden sm:inline font-mono text-[9px] px-1.5 py-0.5 bg-muted border border-border rounded">⌘K</kbd>
            </button>
            <button
              id="workspace-api-btn"
              onClick={() => window.dispatchEvent(new Event("open-api-key-modal"))}
              className="op-btn op-btn-ghost"
            >
              <span className={`status-dot ${hasApiKey ? "status-dot-live" : "status-dot-dead"}`} />
              <span className="font-mono text-[10px]">{hasApiKey ? "AI: ACTIVE" : "AI: NOT SET"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE TAB SWITCHER
          ═══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden relative z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex">
          {(["workspace", "tools", "insight"] as const).map((tab) => {
            const labels = { workspace: "Workspace", tools: `Registry (${TOOLS.length})`, insight: "Insights" };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold font-mono tracking-wide transition-all border-b-2 ${activeTab === tab ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          THREE-ZONE LAYOUT
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex-1 flex container mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-5 gap-5">

        {/* ─────────────────────────────────────────────────────────
            ZONE 1 — COMMAND RAIL (Left Sidebar)
            ───────────────────────────────────────────────────────── */}
        <aside className={`${activeTab === "tools" ? "flex" : "hidden"} lg:flex flex-col w-64 shrink-0`}>
          <div className="op-panel flex flex-col h-full" style={{ maxHeight: "calc(100vh - 180px)", position: "sticky", top: "100px" }}>
            {/* Rail header */}
            <div className="op-panel-header">
              <div className="flex items-center gap-2">
                <Icon name="Compass" className="w-3.5 h-3.5 text-primary" />
                <span className="data-label">Tool Registry</span>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
                {TOOLS.length} TOOLS
              </span>
            </div>

            {/* Search + filter */}
            <div className="p-3 border-b border-border/60 space-y-2">
              <div className="relative">
                <Icon name="Search" className="absolute left-2.5 top-2 w-3 h-3 text-muted-foreground/60" />
                <input
                  id="rail-search"
                  type="text"
                  placeholder="Filter registry..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full h-7 pl-7 pr-3 font-mono text-[11px] bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50"
                />
                {sidebarSearch && (
                  <button onClick={() => setSidebarSearch("")} className="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground">
                    <Icon name="X" className="w-3 h-3" />
                  </button>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="rail-filter-implemented"
                  checked={showOnlyImplemented}
                  onChange={(e) => setShowOnlyImplemented(e.target.checked)}
                  className="w-3 h-3 rounded border-border bg-secondary text-primary focus:ring-0 cursor-pointer"
                />
                <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">Live only</span>
              </label>
            </div>

            {/* File tree */}
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {explorerCategories.length > 0 ? (
                explorerCategories.map((cat) => (
                  <div key={cat.id}>
                    <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
                      <Icon name={cat.icon} className="w-3 h-3 text-primary/60 shrink-0" />
                      <span className="data-label truncate">{cat.name}</span>
                      <span className="ml-auto font-mono text-[8px] text-muted-foreground/50">{cat.tools.length}</span>
                    </div>
                    <div className="border-l border-border/50 ml-3 pl-2 space-y-0.5">
                      {cat.tools.map((tool) => {
                        const active = isToolImplemented(tool.id);
                        return active ? (
                          <Link
                            key={tool.id}
                            href={tool.href}
                            onClick={() => { if (sandboxText.trim()) sessionStorage.setItem("sandbox_transfer_input", sandboxText); }}
                            className="rail-item group"
                          >
                            <Icon name={tool.icon} className="w-3 h-3 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="truncate text-[11px]">{tool.name}</span>
                            {tool.category === "ai" && <span className="ml-auto signal-badge signal-badge-green shrink-0">AI</span>}
                          </Link>
                        ) : (
                          <div
                            key={tool.id}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-muted-foreground/40 select-none"
                            title="Under active development"
                          >
                            <Icon name="Lock" className="w-3 h-3 shrink-0 text-muted-foreground/25" />
                            <span className="truncate">{tool.name}</span>
                            <span className="ml-auto signal-badge signal-badge-muted shrink-0">SOON</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground/50 font-mono">
                  No registry nodes found.
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ─────────────────────────────────────────────────────────
            ZONE 2 — INTELLIGENCE WORKSPACE (Center)
            ───────────────────────────────────────────────────────── */}
        <main className={`${activeTab === "workspace" ? "flex" : "hidden"} lg:flex flex-col flex-1 min-w-0 gap-4`}>

          {/* ··············································
              UNIVERSAL SANDBOX — The visual centerpiece
              ·············································· */}
          <section className="op-panel animate-panel-enter" aria-label="Universal Sandbox">
            {/* Sandbox header */}
            <div className="op-panel-header">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-2 w-2">
                  <span className="animate-signal-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </div>
                <span className="data-label text-foreground">Universal Sandbox</span>
                <span className="signal-badge signal-badge-green">LIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="data-label">Load Demo:</span>
                {(["JSON", "JWT", "Error", "Subnet", "UUID"] as const).map((label) => {
                  const key = label.toLowerCase().replace("error", "error").replace("subnet", "ip") as keyof typeof SAMPLES;
                  const sampleMap: Record<string, keyof typeof SAMPLES> = {
                    JSON: "json", JWT: "jwt", Error: "error", Subnet: "ip", UUID: "uuid",
                  };
                  return (
                    <button
                      key={label}
                      id={`sandbox-sample-${label.toLowerCase()}`}
                      onClick={() => setSandboxText(SAMPLES[sampleMap[label]])}
                      className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-secondary hover:bg-accent border border-border hover:border-primary/30 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sandbox textarea */}
            <div className="relative">
              {/* Scan line animation when sandbox is focused and has content */}
              {sandboxFocused && sandboxText && (
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none z-10 animate-scan-line" />
              )}
              <textarea
                id="sandbox-input"
                placeholder={`Paste anything here — JSON, Base64, JWTs, stack traces, IPs, UUIDs, GitHub URLs, project ideas...\n\nThe platform detects the format and routes to the right tool automatically.`}
                value={sandboxText}
                onChange={(e) => setSandboxText(e.target.value)}
                onFocus={() => setSandboxFocused(true)}
                onBlur={() => setSandboxFocused(false)}
                className="w-full h-52 border-0 focus:outline-none focus:ring-0 p-4 font-mono text-xs bg-secondary/20 dark:bg-black/30 text-foreground placeholder:text-muted-foreground/35 resize-none border-b border-border/50 transition-all duration-150"
                style={{ fontFamily: "var(--font-jetbrains-mono), var(--font-geist-mono), monospace" }}
                spellCheck={false}
              />
            </div>

            {/* Sandbox status bar */}
            <div className="status-bar justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/50">CHARS</span>
                  <span className="text-foreground font-semibold">{sandboxText.length}</span>
                </span>
                <span className="text-muted-foreground/30">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/50">LINES</span>
                  <span className="text-foreground font-semibold">{sandboxText.split("\n").filter(Boolean).length}</span>
                </span>
                <span className="text-muted-foreground/30">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/50">DETECTIONS</span>
                  <span className={`font-semibold ${currentDetections.length > 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {currentDetections.length}
                  </span>
                </span>
              </div>
              {sandboxText && (
                <button
                  id="sandbox-clear-btn"
                  onClick={() => setSandboxText("")}
                  className="flex items-center gap-1 text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
                >
                  <Icon name="Trash" className="w-3 h-3" />
                  <span>CLEAR</span>
                </button>
              )}
            </div>
          </section>

          {/* ··············································
              SMART DETECTION ENGINE
              ·············································· */}
          <section className="op-panel" aria-label="Smart Detection Engine">
            <div className="op-panel-header">
              <div className="flex items-center gap-2.5">
                <Icon name="Cpu" className="w-3.5 h-3.5 text-primary" />
                <span className="data-label text-foreground">Smart Detection Engine</span>
                {currentDetections.length > 0 && (
                  <span className="signal-badge signal-badge-green animate-data-pulse">
                    {currentDetections.length} SIGNAL{currentDetections.length !== 1 ? "S" : ""}
                  </span>
                )}
              </div>
              <span className="data-label italic normal-case" style={{ textTransform: "none", letterSpacing: 0 }}>
                Client-side · zero transmission
              </span>
            </div>

            <div className="p-4">
              {currentDetections.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="Check" className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary font-mono">FORMAT SIGNATURES IDENTIFIED</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentDetections.map((det, i) => {
                      const cfg = DETECTION_TYPE_CONFIG[det.type] || DETECTION_TYPE_CONFIG.general;
                      return (
                        <div
                          key={i}
                          className="animate-data-pulse border border-border bg-secondary/30 rounded p-3.5 flex flex-col gap-3"
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded flex items-center justify-center bg-card border border-border ${cfg.color}`}>
                                <Icon name={det.icon} className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-foreground leading-tight">{det.name}</div>
                              </div>
                            </div>
                            <span className={`signal-badge ${cfg.badgeClass} shrink-0`}>{cfg.badge}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{det.description}</p>
                          {/* Confidence bar */}
                          <div className="confidence-bar">
                            <div className="confidence-fill" style={{ width: det.type === "json" || det.type === "jwt" || det.type === "subnet" || det.type === "uuid" ? "95%" : det.type === "base64" ? "80%" : "70%" }} />
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {det.actions.map((act, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleActionClick(act.href)}
                                className="op-btn op-btn-primary text-[10px] py-1 px-2.5"
                              >
                                <Icon name={act.icon} className="w-3 h-3" />
                                {act.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground/30">
                    <Icon name="Compass" className="w-5 h-5" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground font-mono">AWAITING INPUT</p>
                    <p className="text-[11px] text-muted-foreground/60 max-w-sm text-center">
                      Paste a payload into the sandbox. The detection engine automatically identifies format, structure, and routes to the optimal tool.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ··············································
              TERMINAL CONSOLE
              ·············································· */}
          <section className="op-panel font-mono" aria-label="Terminal Console">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                {/* Traffic lights */}
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-warn/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/70" />
                <span className="font-mono text-[9px] font-bold text-muted-foreground/50 ml-2 uppercase tracking-widest">
                  toolbox@console:~
                </span>
              </div>
              <button
                id="terminal-clear-btn"
                onClick={() => setTerminalLogs([{ type: "output", text: "Console history cleared." }])}
                className="p-1 hover:bg-accent rounded text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
                title="Clear terminal"
              >
                <Icon name="Trash" className="w-3 h-3" />
              </button>
            </div>

            {/* Log viewport */}
            <div className="h-48 p-3 overflow-y-auto space-y-1.5 bg-card/50 dark:bg-black/40 select-text">
              {terminalLogs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap text-[11px] leading-relaxed">
                  {log.type === "input" ? (
                    <div className="flex text-foreground/90">
                      <span className="text-primary font-bold mr-2 shrink-0">toolbox@console:~$</span>
                      <span>{log.text}</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground pl-4">{log.text}</div>
                  )}
                </div>
              ))}
              <div ref={terminalBottomRef} />
            </div>

            {/* Input bar */}
            <form onSubmit={handleTerminalSubmit} className="flex items-center px-3 py-2 border-t border-border/40 bg-card/80 dark:bg-black/60">
              <span className="text-primary font-bold mr-2 text-[11px] select-none shrink-0">toolbox@console:~$</span>
              <input
                id="terminal-input"
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Type 'help' or tool shortcuts..."
                className="flex-1 bg-transparent text-foreground focus:outline-none text-[11px] placeholder:text-muted-foreground/40"
              />
              <button
                type="submit"
                id="terminal-run-btn"
                className="font-mono text-[9px] font-bold px-2 py-1 border border-border/60 bg-secondary hover:bg-accent rounded text-muted-foreground hover:text-foreground cursor-pointer uppercase tracking-widest ml-2"
              >
                RUN
              </button>
            </form>

            {/* Quick shortcuts */}
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-t border-border/30 bg-muted/10">
              <span className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-widest mr-1">Quick:</span>
              {(["help", "list", "json", "jwt", "base64", "uuid", "api"] as const).map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  id={`terminal-shortcut-${cmd}`}
                  onClick={() => setTerminalInput(cmd)}
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-secondary border border-border/60 text-muted-foreground hover:text-foreground hover:border-border cursor-pointer uppercase tracking-wider transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </section>
        </main>

        {/* ─────────────────────────────────────────────────────────
            ZONE 3 — INSIGHT LAYER (Right Panel)
            ───────────────────────────────────────────────────────── */}
        <aside className={`${activeTab === "insight" ? "flex" : "hidden"} lg:flex flex-col w-56 shrink-0 gap-4`}>

          {/* System Telemetry */}
          <div className="op-panel" style={{ position: "sticky", top: "100px" }}>
            <div className="op-panel-header">
              <span className="data-label text-foreground">System Telemetry</span>
              <span className="status-dot status-dot-live animate-signal-ping" />
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              <div className="metric-tile col-span-2">
                <div className="metric-value text-primary">{liveToolCount}</div>
                <div className="metric-label">Tools Live</div>
              </div>
              <div className="metric-tile">
                <div className="metric-value">{CATEGORIES.length}</div>
                <div className="metric-label">Categories</div>
              </div>
              <div className="metric-tile">
                <div className="metric-value" style={{ color: currentDetections.length > 0 ? "hsl(var(--signal))" : undefined }}>
                  {currentDetections.length}
                </div>
                <div className="metric-label">Detections</div>
              </div>
              <div className="metric-tile col-span-2">
                <div className="metric-value text-sm font-mono" style={{ fontSize: "14px" }}>
                  {sandboxText.length > 0 ? `${sandboxText.length} chr` : "—"}
                </div>
                <div className="metric-label">Sandbox Payload</div>
              </div>
            </div>

            {/* AI status */}
            <div className="border-t border-border/50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="data-label">Gemini AI</span>
                <span className={`signal-badge ${hasApiKey ? "signal-badge-green" : "signal-badge-muted"}`}>
                  {hasApiKey ? "ACTIVE" : "OFFLINE"}
                </span>
              </div>
              {!hasApiKey && (
                <button
                  id="insight-api-btn"
                  onClick={() => window.dispatchEvent(new Event("open-api-key-modal"))}
                  className="op-btn op-btn-ghost w-full justify-center text-[10px]"
                >
                  <Icon name="Sparkles" className="w-3 h-3" />
                  Configure Key
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="op-panel">
            <div className="op-panel-header">
              <span className="data-label text-foreground">Quick Actions</span>
            </div>
            <div className="p-2 space-y-1">
              {[
                { id: "json-formatter", label: "JSON Format", icon: "Braces", badge: "" },
                { id: "base64-decoder", label: "Base64 Decode", icon: "Key", badge: "" },
                { id: "jwt-decoder", label: "JWT Decode", icon: "ShieldAlert", badge: "" },
                { id: "error-translator", label: "AI Debugger", icon: "Sparkles", badge: "AI" },
                { id: "diff-checker", label: "Diff Check", icon: "Terminal", badge: "" },
                { id: "password-generator", label: "Gen Password", icon: "Lock", badge: "" },
              ].map((action) => (
                <button
                  key={action.id}
                  id={`insight-action-${action.id}`}
                  onClick={() => handleActionClick(`/tools/${action.id}`)}
                  className="rail-item w-full text-left"
                >
                  <Icon name={action.icon} className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1 text-[11px]">{action.label}</span>
                  {action.badge && <span className="signal-badge signal-badge-green shrink-0">{action.badge}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Notes */}
          <div className="op-panel">
            <div className="op-panel-header">
              <span className="data-label text-foreground">Platform Notes</span>
            </div>
            <div className="p-3 space-y-2.5">
              {[
                { icon: "Shield", label: "Client-side only", desc: "Zero server trace" },
                { icon: "Zap", label: "Offline capable", desc: "Works without network" },
                { icon: "Lock", label: "CSPRNG secured", desc: "Browser-native crypto" },
              ].map((note) => (
                <div key={note.label} className="flex items-start gap-2">
                  <Icon name={note.icon} className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-semibold text-foreground">{note.label}</div>
                    <div className="text-[9px] text-muted-foreground font-mono">{note.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TOOL CATALOG — Full registry grid
          ═══════════════════════════════════════════════════════════ */}
      <section id="catalog" className="relative z-10 border-t border-border scroll-mt-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">

          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Compass" className="w-4 h-4 text-primary" />
                <span className="data-label text-foreground">Tool Registry</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">All Utility Libraries</h2>
              <p className="text-xs text-muted-foreground mt-1">Browse, search, or filter the full client-side tool registry.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Icon name="Search" className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  id="catalog-search"
                  type="text"
                  placeholder="Filter registry..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full sm:w-52 h-9 pl-8 pr-3 font-mono text-xs bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
              <select
                id="catalog-category-filter"
                value={selectedCatalogCategory}
                onChange={(e) => setSelectedCatalogCategory(e.target.value as ToolCategory | "all")}
                className="h-9 px-3 border border-border rounded bg-card font-mono text-xs focus:outline-none text-foreground cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards grid */}
          {filteredCatalogTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalogTools.map((tool) => {
                const active = isToolImplemented(tool.id);
                return (
                  <div
                    key={tool.id}
                    className={`tool-card premium-card-hover group ${!active ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-9 h-9 rounded border flex items-center justify-center shrink-0 transition-all duration-150 ${active ? "border-border bg-secondary text-muted-foreground group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary" : "border-border/40 bg-secondary/40 text-muted-foreground/30"}`}>
                        <Icon name={tool.icon} className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {tool.isPopular && <span className="signal-badge signal-badge-amber">HOT</span>}
                        {tool.category === "ai" && <span className="signal-badge signal-badge-green">AI</span>}
                        {!active && <span className="signal-badge signal-badge-muted">SOON</span>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm font-bold mb-1 transition-colors ${active ? "text-foreground group-hover:text-primary" : "text-muted-foreground/60"}`}>
                        {tool.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{tool.description}</p>
                    </div>
                    <div className="mt-1">
                      {active ? (
                        <button
                          id={`catalog-tool-${tool.id}`}
                          onClick={() => handleActionClick(tool.href)}
                          className="op-btn op-btn-ghost text-[10px] py-1 px-2"
                        >
                          <span>Open Tool</span>
                          <Icon name="ArrowRight" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40 font-mono">
                          <Icon name="Lock" className="w-3 h-3" /> In development
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="op-panel text-center p-12 max-w-sm mx-auto">
              <Icon name="Info" className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-bold text-foreground mb-1">No matches found</p>
              <p className="text-xs text-muted-foreground mb-4">Adjust your search or category filter.</p>
              <button
                onClick={() => { setCatalogSearch(""); setSelectedCatalogCategory("all"); }}
                className="op-btn op-btn-ghost mx-auto"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CATEGORIES SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section id="categories" className="relative z-10 border-t border-border bg-secondary/10 scroll-mt-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Layers" className="w-4 h-4 text-primary" />
                <span className="data-label text-foreground">Workspace Segments</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Segmented Development Workspace</h2>
              <p className="text-xs text-muted-foreground mt-1">A comprehensive utility suite segmented for different development workflows.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((category) => (
              <div
                key={category.id}
                id={`category-card-${category.id}`}
                onClick={() => {
                  setSelectedCatalogCategory(category.id);
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="tool-card premium-card-hover group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded border border-border bg-secondary flex items-center justify-center text-muted-foreground group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-150 shrink-0">
                    <Icon name={category.icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                    <span className="font-mono text-[9px] text-muted-foreground/60 uppercase tracking-wider">
                      {TOOLS.filter(t => t.category === category.id).length} tools
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FAQ SECTION — Operational accordion
          ═══════════════════════════════════════════════════════════ */}
      <section id="faqs" className="relative z-10 border-t border-border scroll-mt-24">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Info" className="w-4 h-4 text-primary" />
              <span className="data-label text-foreground">Platform Intel</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
            <p className="text-xs text-muted-foreground mt-1">Security posture, pricing model, and operational details.</p>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, index) => (
              <div key={index} className="op-panel">
                <button
                  id={`faq-item-${index}`}
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-start justify-between gap-3 p-4 text-left cursor-pointer hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[9px] font-bold text-primary/60 mt-0.5 shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground leading-snug">{faq.question}</h3>
                  </div>
                  <Icon
                    name={expandedFaq === index ? "ChevronUp" : "ChevronDown"}
                    className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-150"
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 pl-10 animate-panel-enter">
                    <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
