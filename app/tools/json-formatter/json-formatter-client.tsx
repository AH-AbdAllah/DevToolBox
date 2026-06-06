"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { downloadAsFile, cn } from "@/lib/utils";

const SAMPLE_JSON = `{
  "projectName": "DevToolBox",
  "version": 1.0,
  "status": "production-ready",
  "secure": true,
  "toolsImplemented": [
    "JSON Formatter & Validator",
    "Base64 Encoder / Decoder",
    "Password Generator"
  ],
  "architecture": {
    "framework": "Next.js 14 App Router",
    "styling": "Tailwind CSS v4",
    "strictTypeScript": true
  },
  "database": null
}`;

const MAX_SAFE_SIZE = 2 * 1024 * 1024; // 2MB

export function JsonFormatterClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorLocation, setErrorLocation] = useState<{ line: number; col: number } | null>(null);
  const [indentSize, setIndentSize] = useState<"2" | "4" | "tab">("2");
  const [viewMode, setViewMode] = useState<"text" | "tree">("text");
  const [parsedObject, setParsedObject] = useState<any>(null);
  const [mobileTab, setMobileTab] = useState<"input" | "output">("input");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isCopied, copy } = useCopyToClipboard();

  // Load sandbox transfer inputs on mount
  useEffect(() => {
    const transfer = sessionStorage.getItem("sandbox_transfer_input");
    if (transfer) {
      setInput(transfer);
      // Delay slightly to ensure states are bound before formatting
      setTimeout(() => {
        handleFormat(transfer);
      }, 50);
      sessionStorage.removeItem("sandbox_transfer_input");
    }
  }, []);

  // Helper: Find exact line and column of syntax errors
  const getErrorLineAndColumn = (json: string, errMsg: string) => {
    const positionMatch = errMsg.match(/position (\d+)/i);
    if (!positionMatch) return null;
    const pos = parseInt(positionMatch[1], 10);
    let line = 1;
    let col = 1;
    for (let i = 0; i < Math.min(pos, json.length); i++) {
      if (json[i] === "\n") {
        line++;
        col = 1;
      } else {
        col++;
      }
    }
    return { line, col };
  };

  // Format action (Beautify)
  const handleFormat = (val = input) => {
    if (!val.trim()) {
      setOutput("");
      setError(null);
      setErrorLocation(null);
      setParsedObject(null);
      return;
    }

    if (val.length > MAX_SAFE_SIZE) {
      setError("Processing limit warning: Input is larger than 2MB. Parsing this may lock your browser tab. Try cleaning smaller snippets.");
      setParsedObject(null);
      setOutput("");
      setMobileTab("output");
      return;
    }

    try {
      const parsed = JSON.parse(val);
      setParsedObject(parsed);
      const spaces = indentSize === "tab" ? "\t" : parseInt(indentSize, 10);
      const formatted = JSON.stringify(parsed, null, spaces);
      setOutput(formatted);
      setError(null);
      setErrorLocation(null);
      setMobileTab("output"); // Switch to output panel on mobile
    } catch (e: any) {
      setError(e.message);
      setParsedObject(null);
      const location = getErrorLineAndColumn(val, e.message);
      setErrorLocation(location);
      setMobileTab("output");
    }
  };

  // Minify action
  const handleMinify = () => {
    if (!input.trim()) return;
    if (input.length > MAX_SAFE_SIZE) {
      setError("Processing limit warning: Input is larger than 2MB. Parsing this may lock your browser tab. Try cleaning smaller snippets.");
      setParsedObject(null);
      setOutput("");
      setMobileTab("output");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setParsedObject(parsed);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
      setErrorLocation(null);
      setMobileTab("output"); // Switch to output panel on mobile
    } catch (e: any) {
      setError(e.message);
      setParsedObject(null);
      const location = getErrorLineAndColumn(input, e.message);
      setErrorLocation(location);
      setMobileTab("output");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
    setErrorLocation(null);
    setParsedObject(null);
    setMobileTab("input");
  };

  const loadSample = () => {
    setInput(SAMPLE_JSON);
    handleFormat(SAMPLE_JSON);
  };

  // File Upload handler
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SAFE_SIZE) {
      setError("File upload warning: Uploaded file is larger than 2MB. Loading this may freeze the website.");
      setMobileTab("output");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInput(text);
      handleFormat(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-muted-foreground">Indentation:</span>
          <div className="inline-flex rounded-lg border border-input p-0.5 bg-background">
            {(["2", "4", "tab"] as const).map((size) => (
              <button
                key={size}
                onClick={() => {
                  setIndentSize(size);
                  setTimeout(() => handleFormat(), 10);
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer capitalize ${
                  indentSize === size
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {size} {size !== "tab" ? "spaces" : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadSample}>
            Load Sample
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1"
          >
            <Icon name="Upload" className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

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
          Input Editor
        </button>
        <button
          onClick={() => setMobileTab("output")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "output"
              ? "bg-secondary text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Result Output {output || error ? "•" : ""}
        </button>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input area */}
        <Card className={cn("flex flex-col h-[550px] border-border", {
          "hidden lg:flex": mobileTab !== "input"
        })}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <span className="text-sm font-bold flex items-center">
              <Icon name="Terminal" className="w-4 h-4 mr-2 text-primary" />
              <span>Raw JSON Input</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClear} title="Clear Input">
                <Icon name="Trash" className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </div>
          <CardContent className="flex-1 p-0 relative">
            <Textarea
              placeholder="Paste raw or unformatted JSON text here..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                try {
                  if (e.target.value.trim() === "") {
                    setError(null);
                    setErrorLocation(null);
                  } else if (e.target.value.length > MAX_SAFE_SIZE) {
                    setError("Large payload detected. Click Beautify / Minify to format cautiously.");
                  } else {
                    JSON.parse(e.target.value);
                    setError(null);
                    setErrorLocation(null);
                  }
                } catch (err: any) {
                  setError(err.message);
                  setErrorLocation(getErrorLineAndColumn(e.target.value, err.message));
                }
              }}
              mono
              className="w-full h-full border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 font-mono text-xs overflow-auto resize-none"
            />
          </CardContent>
          <div className="flex items-center justify-between p-3 border-t border-border bg-muted/10">
            <div className="text-xs text-muted-foreground font-mono">
              {input.length > 0 && `${(input.length / 1024).toFixed(1)} KB`}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleMinify} disabled={!input.trim()}>
                Minify
              </Button>
              <Button size="sm" onClick={() => handleFormat()} disabled={!input.trim()}>
                Beautify
              </Button>
            </div>
          </div>
        </Card>

        {/* Output area */}
        <Card className={cn("flex flex-col h-[550px] border-border", {
          "hidden lg:flex": mobileTab !== "output"
        })}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold flex items-center">
                <Icon name="Braces" className="w-4 h-4 mr-2 text-primary" />
                <span>Result Output</span>
              </span>
              {parsedObject && (
                <div className="inline-flex rounded-lg border border-input p-0.5 bg-background scale-90">
                  <button
                    onClick={() => setViewMode("text")}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-semibold cursor-pointer ${
                      viewMode === "text"
                        ? "bg-secondary text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Raw
                  </button>
                  <button
                    onClick={() => setViewMode("tree")}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-semibold cursor-pointer ${
                      viewMode === "tree"
                        ? "bg-secondary text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Tree
                  </button>
                </div>
              )}
            </div>

            {output && viewMode === "text" && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadAsFile(output, "formatted.json", "application/json")}
                  className="h-8 px-2"
                >
                  <Icon name="Download" className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">Download</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => copy(output)} className="h-8 px-3">
                  {isCopied ? (
                    <>
                      <Icon name="Check" className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                      <span className="text-xs text-emerald-500 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Copy" className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <CardContent className="flex-1 p-0 overflow-auto bg-card">
            {error ? (
              <div className="p-6 h-full flex flex-col justify-center bg-destructive/5 text-destructive space-y-4">
                <div className="flex items-center space-x-2.5">
                  <Icon name="AlertCircle" className="w-6 h-6 shrink-0" />
                  <h4 className="font-bold text-sm">JSON Parsing Alert</h4>
                </div>
                <div className="text-xs bg-destructive/10 border border-destructive/20 rounded-lg p-4 font-mono leading-relaxed space-y-1.5">
                  <p className="font-semibold">{error}</p>
                  {errorLocation && (
                    <p className="text-[10px] text-destructive/80">
                      Error located at: Line <span className="font-bold underline">{errorLocation.line}</span>, Column{" "}
                      <span className="font-bold underline">{errorLocation.col}</span>
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  JSON expects strict formatting rules: double quotes for all keys, matching brackets/braces, comma elements separation, and no trailing commas.
                </p>
              </div>
            ) : viewMode === "tree" && parsedObject ? (
              <div className="p-5 font-mono text-xs overflow-auto h-full">
                <JsonTreeInspector data={parsedObject} name="root" isLast={true} />
              </div>
            ) : (
              <pre className="p-4 font-mono text-xs overflow-auto h-full w-full select-text whitespace-pre bg-card text-foreground">
                {output || <span className="text-muted-foreground/60">Formatted JSON output will display here...</span>}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Tree view rendering helper
interface JsonTreeInspectorProps {
  data: any;
  name: string;
  isLast: boolean;
}

function JsonTreeInspector({ data, name, isLast }: JsonTreeInspectorProps) {
  const [isOpen, setIsOpen] = useState(true);

  const getType = (val: any): "object" | "array" | "string" | "number" | "boolean" | "null" => {
    if (val === null) return "null";
    if (Array.isArray(val)) return "array";
    if (typeof val === "object") return "object";
    return typeof val as any;
  };

  const type = getType(data);
  const toggleCollapse = () => setIsOpen(!isOpen);

  const renderValue = (val: any, valType: string) => {
    if (valType === "null") return <span className="text-amber-600 font-semibold">null</span>;
    if (valType === "boolean") return <span className="text-sky-500 font-semibold">{val ? "true" : "false"}</span>;
    if (valType === "number") return <span className="text-blue-500">{val}</span>;
    return <span className="text-emerald-500 select-text">"{val}"</span>;
  };

  const renderName = () => (
    <span className="text-violet-500 font-semibold mr-1.5 select-all">"{name}":</span>
  );

  if (type === "object" || type === "array") {
    const keys = Object.keys(data);
    const count = keys.length;
    const isEmpty = count === 0;

    return (
      <div className="ml-4 my-1 select-none">
        <div className="flex items-center space-x-1">
          {!isEmpty && (
            <button
              onClick={toggleCollapse}
              className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
            >
              <Icon
                name="ChevronRight"
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  isOpen ? "rotate-90 text-primary" : ""
                }`}
              />
            </button>
          )}

          {renderName()}

          <span className="text-muted-foreground/80 font-medium">
            {type === "array" ? `Array(${count})` : `Object {`}
          </span>

          {isEmpty && (
            <span className="text-muted-foreground/80 font-medium">
              {type === "array" ? "[]" : "}"}
            </span>
          )}
        </div>

        {isOpen && !isEmpty && (
          <div className="border-l border-border/50 pl-3 ml-2 mt-1 space-y-1">
            {keys.map((key, index) => (
              <JsonTreeInspector
                key={key}
                name={key}
                data={data[key]}
                isLast={index === count - 1}
              />
            ))}
          </div>
        )}

        {isOpen && !isEmpty && type === "object" && (
          <div className="text-muted-foreground/80 font-medium ml-4 mt-0.5">{"}"}</div>
        )}
      </div>
    );
  }

  return (
    <div className="ml-8 my-1 flex items-start">
      {renderName()}
      {renderValue(data, type)}
      {!isLast && <span className="text-muted-foreground/60 font-semibold ml-0.5">,</span>}
    </div>
  );
}
