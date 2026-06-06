"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/ui/icon";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { downloadAsFile, cn } from "@/lib/utils";

const MAX_SAFE_SIZE = 2 * 1024 * 1024; // 2MB

export function Base64Client() {
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [textInput, setTextInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"input" | "output">("input");

  // Load sandbox inputs on mount
  useEffect(() => {
    const transfer = sessionStorage.getItem("sandbox_transfer_input");
    if (transfer) {
      setTextInput(transfer);
      setMode("decode");
      setTimeout(() => {
        handleTextConvert(transfer, "decode");
      }, 50);
      sessionStorage.removeItem("sandbox_transfer_input");
    }
  }, []);

  // File states
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number; type: string } | null>(null);
  const [fileBase64, setFileBase64] = useState("");
  const [fileDataUri, setFileDataUri] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isCopied, copy } = useCopyToClipboard();
  const { isCopied: isUriCopied, copy: copyUri } = useCopyToClipboard();
  const { isCopied: isHtmlCopied, copy: copyHtml } = useCopyToClipboard();

  // Safe Unicode/UTF-8 Base64 Encoder
  const encodeUtf8ToBase64 = (str: string): string => {
    try {
      const base64 = btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );

      if (urlSafe) {
        return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      }
      return base64;
    } catch (err) {
      throw new Error("Unable to encode string to Base64.");
    }
  };

  // Safe Unicode/UTF-8 Base64 Decoder
  const decodeBase64ToUtf8 = (str: string): string => {
    let sanitized = str.trim();
    if (!sanitized) return "";

    try {
      sanitized = sanitized.replace(/-/g, "+").replace(/_/g, "/");
      const padLength = (4 - (sanitized.length % 4)) % 4;
      if (padLength > 0) {
        sanitized += "=".repeat(padLength);
      }

      const binaryString = atob(sanitized);
      const percentEscaped = binaryString
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("");

      return decodeURIComponent(percentEscaped);
    } catch (err) {
      throw new Error("Invalid Base64 sequence. Please check for correct characters.");
    }
  };

  const handleTextConvert = (val = textInput, currentMode = mode) => {
    if (!val.trim()) {
      setTextOutput("");
      setError(null);
      return;
    }

    if (val.length > MAX_SAFE_SIZE) {
      setError("Processing limit warning: Input is larger than 2MB. Converting this may lock your browser tab. Try shorter snippets.");
      setTextOutput("");
      setMobileTab("output");
      return;
    }

    try {
      if (currentMode === "encode") {
        const encoded = encodeUtf8ToBase64(val);
        setTextOutput(encoded);
        setError(null);
      } else {
        const decoded = decodeBase64ToUtf8(val);
        setTextOutput(decoded);
        setError(null);
      }
      setMobileTab("output"); // Auto-focus results panel on mobile
    } catch (err: any) {
      setError(err.message);
      setTextOutput("");
      setMobileTab("output");
    }
  };

  const handleModeChange = (nextMode: "encode" | "decode") => {
    setMode(nextMode);
    if (textOutput && !error) {
      setTextInput(textOutput);
      setTextOutput("");
      setError(null);
      setTimeout(() => handleTextConvert(textOutput, nextMode), 10);
    } else {
      setTextOutput("");
      setError(null);
    }
  };

  const handleClear = () => {
    setTextInput("");
    setTextOutput("");
    setError(null);
    setFileDetails(null);
    setFileBase64("");
    setFileDataUri("");
    setMobileTab("input");
  };

  const loadSample = () => {
    if (mode === "encode") {
      const sample = "DevToolBox 🚀 is a 100% secure client-side utility platform! Emojis like 🎉 and UTF-8 letters work perfectly.";
      setTextInput(sample);
      setTimeout(() => handleTextConvert(sample, "encode"), 10);
    } else {
      const sample = "RGV2VG9vbEJveCA🚀IGlzIGEgMTAwJSBzZWN1cmUgY2xpZW50LXNpZGUgdXRpbGl0eSBwbGF0Zm9ybSE=";
      setTextInput(sample);
      setTimeout(() => handleTextConvert(sample, "decode"), 10);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    if (file.size > MAX_SAFE_SIZE) {
      alert("File size limit warning: Processing files larger than 2MB may crash this browser tab.");
      return;
    }

    setFileDetails({
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setFileDataUri(dataUri);
      
      const base64Index = dataUri.indexOf(";base64,");
      if (base64Index !== -1) {
        const rawBase64 = dataUri.slice(base64Index + 8);
        setFileBase64(rawBase64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center space-x-6">
          <div className="inline-flex rounded-lg border border-input p-0.5 bg-background">
            <button
              onClick={() => {
                setInputType("text");
                handleClear();
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                inputType === "text"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Text Input
            </button>
            <button
              onClick={() => {
                setInputType("file");
                handleClear();
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                inputType === "file"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              File Upload
            </button>
          </div>

          {inputType === "text" && (
            <div className="inline-flex rounded-lg border border-input p-0.5 bg-background">
              <button
                onClick={() => handleModeChange("encode")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  mode === "encode"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Encode
              </button>
              <button
                onClick={() => handleModeChange("decode")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  mode === "decode"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Decode
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {inputType === "text" && (
            <div className="w-44">
              <Switch
                label="URL-safe Base64"
                checked={urlSafe}
                onChange={(e) => {
                  setUrlSafe(e.target.checked);
                  setTimeout(() => handleTextConvert(), 10);
                }}
              />
            </div>
          )}
          {inputType === "text" && (
            <Button variant="outline" size="sm" onClick={loadSample}>
              Load Sample
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Tab Swapper */}
      {inputType === "text" && (
        <div className="lg:hidden flex rounded-lg border border-input p-0.5 bg-background">
          <button
            onClick={() => setMobileTab("input")}
            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mobileTab === "input"
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Raw Input
          </button>
          <button
            onClick={() => setMobileTab("output")}
            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mobileTab === "output"
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Base64 Result {textOutput || error ? "•" : ""}
          </button>
        </div>
      )}

      {/* Text Mode Editor View */}
      {inputType === "text" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className={cn("flex flex-col h-[500px]", {
            "hidden lg:flex": mobileTab !== "input"
          })}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
              <span className="text-sm font-bold flex items-center">
                <Icon name="Terminal" className="w-4 h-4 mr-2 text-primary" />
                <span>Raw Text Input</span>
              </span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClear} title="Clear">
                <Icon name="Trash" className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
            <CardContent className="flex-1 p-0">
              <Textarea
                placeholder={
                  mode === "encode"
                    ? "Type or paste standard text string to encode..."
                    : "Paste Base64 formatted string to decode..."
                }
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  handleTextConvert(e.target.value);
                }}
                className="w-full h-full border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 font-mono text-xs resize-none overflow-auto"
              />
            </CardContent>
          </Card>

          <Card className={cn("flex flex-col h-[500px]", {
            "hidden lg:flex": mobileTab !== "output"
          })}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
              <span className="text-sm font-bold flex items-center">
                <Icon name="FileText" className="w-4 h-4 mr-2 text-primary" />
                <span>Base64 Result Output</span>
              </span>
              {textOutput && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      downloadAsFile(
                        textOutput,
                        mode === "encode" ? "encoded.txt" : "decoded.txt",
                        "text/plain"
                      )
                    }
                    className="h-8 px-2"
                  >
                    <Icon name="Download" className="w-3.5 h-3.5 mr-1" />
                    <span className="text-xs">Download</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copy(textOutput)} className="h-8 px-3">
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
                <div className="p-6 h-full flex flex-col justify-center bg-destructive/5 text-destructive space-y-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertCircle" className="w-5 h-5 shrink-0" />
                    <h4 className="font-bold text-sm">Base64 Decode Error</h4>
                  </div>
                  <p className="text-xs bg-destructive/10 border border-destructive/20 rounded-lg p-4 font-mono">
                    {error}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ensure the source string only contains valid base64 character sets (A-Z, a-z, 0-9, +, /, and padding =). Spaces or newlines might cause decode exceptions.
                  </p>
                </div>
              ) : (
                <pre className="p-4 font-mono text-xs overflow-auto h-full w-full select-text whitespace-pre bg-card text-foreground">
                  {textOutput || (
                    <span className="text-muted-foreground/60">
                      Result will generate here as you type in the input box...
                    </span>
                  )}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* File Upload Mode View */}
      {inputType === "file" && (
        <div className="space-y-6 animate-fade-in">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-muted-foreground/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground mb-4">
              <Icon name="Upload" className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-1">Drag and drop file here</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs leading-relaxed">
              Supports images, small videos, texts, zip folders, or binaries. Limit file size to 2MB to keep browser tab responsive.
            </p>
            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
              Choose File
            </Button>
          </div>

          {fileDetails && (
            <Card className="animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-border bg-muted/20">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0 shadow-sm">
                    <Icon name="FileText" className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate text-foreground">{fileDetails.name}</h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      {(fileDetails.size / 1024).toFixed(2)} KB • {fileDetails.type}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClear} className="self-end sm:self-auto">
                  Reset
                </Button>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Raw Base64 Code
                    </span>
                    <Button variant="outline" size="sm" onClick={() => copy(fileBase64)} className="h-7 px-2">
                      {isCopied ? (
                        <>
                          <Icon name="Check" className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                          <span className="text-xs text-emerald-500 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Icon name="Copy" className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs">Copy Raw Code</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <textarea
                    readOnly
                    value={fileBase64}
                    className="w-full h-24 p-3 bg-secondary/30 text-xs font-mono rounded-lg border border-border focus:outline-none resize-none select-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Data URL Format
                    </span>
                    <Button variant="outline" size="sm" onClick={() => copyUri(fileDataUri)} className="h-7 px-2">
                      {isUriCopied ? (
                        <>
                          <Icon name="Check" className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                          <span className="text-xs text-emerald-500 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Icon name="Copy" className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs">Copy Data URL</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <textarea
                    readOnly
                    value={fileDataUri}
                    className="w-full h-24 p-3 bg-secondary/30 text-xs font-mono rounded-lg border border-border focus:outline-none resize-none select-all"
                  />
                </div>

                {fileDetails.type.startsWith("image/") && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        HTML Image Tag Embed
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyHtml(`<img src="${fileDataUri}" alt="${fileDetails.name}" />`)}
                        className="h-7 px-2"
                      >
                        {isHtmlCopied ? (
                          <>
                            <Icon name="Check" className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                            <span className="text-xs text-emerald-500 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Icon name="Copy" className="w-3.5 h-3.5 mr-1" />
                            <span className="text-xs">Copy HTML Code</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <textarea
                      readOnly
                      value={`<img src="${fileDataUri}" alt="${fileDetails.name}" />`}
                      className="w-full h-16 p-3 bg-secondary/30 text-xs font-mono rounded-lg border border-border focus:outline-none resize-none select-all"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
