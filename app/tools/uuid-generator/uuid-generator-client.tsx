"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { downloadAsFile } from "@/lib/utils";

export function UuidGeneratorClient() {
  const [version, setVersion] = useState<"v4" | "v1">("v4");
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [braces, setBraces] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);
  const { isCopied, copy } = useCopyToClipboard();

  // Helper: UUID V4 generator (CSPRNG)
  const generateV4 = () => {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // v4 identifier
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xxxxxx

    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join("-");
  };

  // Helper: UUID V1 generator (Timestamp approximated)
  const generateV1 = () => {
    const now = Date.now();
    const epochOffset = 12219292800000; // Offset between JS epoch and UUID epoch
    const time = (now + epochOffset) * 10000;

    const timeHex = time.toString(16).padStart(16, "0");
    const timeLow = timeHex.slice(8, 16);
    const timeMid = timeHex.slice(4, 8);
    const timeHi = (parseInt(timeHex.slice(0, 4), 16) & 0x0fff) | 0x1000;
    const timeHiHex = timeHi.toString(16).padStart(4, "0");

    const randomBytes = new Uint8Array(8);
    window.crypto.getRandomValues(randomBytes);

    const clockSeq = (((randomBytes[0] << 8) | randomBytes[1]) & 0x3fff) | 0x8000;
    const clockSeqHex = clockSeq.toString(16).padStart(4, "0");

    const nodeHex = Array.from(randomBytes.slice(2))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `${timeLow}-${timeMid}-${timeHiHex}-${clockSeqHex}-${nodeHex}`;
  };

  const handleGenerate = () => {
    const list: string[] = [];
    const limit = Math.min(Math.max(1, count), 500);
    for (let i = 0; i < limit; i++) {
      let rawUuid = version === "v4" ? generateV4() : generateV1();

      // Format casing
      if (uppercase) {
        rawUuid = rawUuid.toUpperCase();
      } else {
        rawUuid = rawUuid.toLowerCase();
      }

      // Format hyphens
      if (!hyphens) {
        rawUuid = rawUuid.replace(/-/g, "");
      }

      // Format braces
      if (braces) {
        rawUuid = `{${rawUuid}}`;
      }

      list.push(rawUuid);
    }
    setUuids(list);
  };

  // Generate on mount
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleCopyAll = () => {
    if (uuids.length === 0) return;
    copy(uuids.join("\n"));
  };

  const handleDownload = () => {
    if (uuids.length === 0) return;
    downloadAsFile(uuids.join("\n"), "uuids.txt", "text/plain");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Control panel */}
      <div className="lg:col-span-1">
        <Card className="border-border">
          <div className="px-4 py-3 border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider flex items-center">
            <Icon name="Settings" className="w-4 h-4 mr-2 text-primary" />
            <span>Generator Settings</span>
          </div>
          <CardContent className="p-5 space-y-5">
            {/* Version Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">UUID Version</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setVersion("v4")}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    version === "v4"
                      ? "bg-primary border-primary text-primary-foreground shadow"
                      : "border-input bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  V4 (Random)
                </button>
                <button
                  onClick={() => setVersion("v1")}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    version === "v1"
                      ? "bg-primary border-primary text-primary-foreground shadow"
                      : "border-input bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  V1 (Time-based)
                </button>
              </div>
            </div>

            {/* Quantity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="text-muted-foreground">Quantity</label>
                <span className="text-foreground">{count}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-secondary cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/80 font-medium">
                <span>1</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* Formatting Checks */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <label className="text-xs font-semibold text-muted-foreground">Formatting</label>
              <div className="space-y-2.5">
                <label className="flex items-center space-x-2.5 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={(e) => setUppercase(e.target.checked)}
                    className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
                  />
                  <span>Uppercase Letters</span>
                </label>
                <label className="flex items-center space-x-2.5 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={braces}
                    onChange={(e) => setBraces(e.target.checked)}
                    className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
                  />
                  <span>Braces {"{...}"}</span>
                </label>
                <label className="flex items-center space-x-2.5 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hyphens}
                    onChange={(e) => setHyphens(e.target.checked)}
                    className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
                  />
                  <span>Include Hyphens (-)</span>
                </label>
              </div>
            </div>

            {/* Trigger Button */}
            <Button onClick={handleGenerate} className="w-full mt-4">
              <Icon name="Sparkles" className="w-4 h-4 mr-2" />
              <span>Generate UUIDs</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Output results pane */}
      <div className="lg:col-span-2">
        <Card className="border-border flex flex-col h-[480px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center">
              <Icon name="Binary" className="w-4 h-4 mr-2 text-primary" />
              <span>Generated IDs ({uuids.length})</span>
            </span>
            {uuids.length > 0 && (
              <div className="flex items-center space-x-1.5">
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleDownload}>
                  <Icon name="Download" className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">Download</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyAll} className="h-8 px-2.5">
                  {isCopied ? (
                    <>
                      <Icon name="Check" className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                      <span className="text-xs text-emerald-500 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Copy" className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs">Copy All</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          <CardContent className="p-0 overflow-auto flex-1 bg-card">
            {uuids.length > 0 ? (
              <pre className="p-4 font-mono text-xs text-foreground leading-relaxed overflow-auto select-all whitespace-pre">
                {uuids.join("\n")}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No UUIDs generated yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
