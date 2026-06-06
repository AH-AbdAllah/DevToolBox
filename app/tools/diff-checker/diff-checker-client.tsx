"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  originalLineNo?: number;
  modifiedLineNo?: number;
}

export function DiffCheckerClient() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diffResults, setDiffResults] = useState<DiffLine[]>([]);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const [mobileTab, setMobileTab] = useState<"original" | "modified" | "result">("original");

  // Longest Common Subsequence (LCS) Diffing Engine
  const computeDiff = () => {
    setHasCompared(true);
    if (!original.trim() && !modified.trim()) {
      setDiffResults([]);
      return;
    }

    const oLines = original.split(/\r?\n/);
    const mLines = modified.split(/\r?\n/);

    // Helper to sanitize strings for comparison
    const cleanStr = (str: string): string => {
      let temp = str;
      if (ignoreCase) temp = temp.toLowerCase();
      if (ignoreWhitespace) temp = temp.replace(/\s+/g, "");
      return temp;
    };

    // DP Table for LCS length
    const dp: number[][] = Array(oLines.length + 1)
      .fill(0)
      .map(() => Array(mLines.length + 1).fill(0));

    for (let i = 1; i <= oLines.length; i++) {
      for (let j = 1; j <= mLines.length; j++) {
        if (cleanStr(oLines[i - 1]) === cleanStr(mLines[j - 1])) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to compile diff structures
    const results: DiffLine[] = [];
    let i = oLines.length;
    let j = mLines.length;

    while (i > 0 || j > 0) {
      if (
        i > 0 &&
        j > 0 &&
        cleanStr(oLines[i - 1]) === cleanStr(mLines[j - 1])
      ) {
        results.unshift({
          type: "unchanged",
          content: oLines[i - 1],
          originalLineNo: i,
          modifiedLineNo: j,
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        results.unshift({
          type: "added",
          content: mLines[j - 1],
          modifiedLineNo: j,
        });
        j--;
      } else {
        results.unshift({
          type: "removed",
          content: oLines[i - 1],
          originalLineNo: i,
        });
        i--;
      }
    }

    setDiffResults(results);
    setMobileTab("result"); // Auto-focus results tab on mobile
  };

  const handleClear = () => {
    setOriginal("");
    setModified("");
    setDiffResults([]);
    setHasCompared(false);
    setMobileTab("original");
  };

  const loadSample = () => {
    const originalSample = `// Original User Class
class User {
  constructor(name) {
    this.name = name;
    this.active = true;
  }

  getName() {
    return this.name;
  }
}`;

    const modifiedSample = `// Revised User Class
class User {
  constructor(name, role) {
    this.name = name;
    this.role = role || "Developer";
    this.active = true;
  }

  getName() {
    return this.name;
  }

  getRole() {
    return this.role;
  }
}`;

    setOriginal(originalSample);
    setModified(modifiedSample);
    setHasCompared(false);
    setMobileTab("modified");
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center space-x-6">
          <div className="w-36">
            <Switch
              label="Ignore Case"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
            />
          </div>
          <div className="w-44">
            <Switch
              label="Ignore Whitespace"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadSample}>
            Load Sample
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <Button size="sm" onClick={computeDiff} disabled={!original.trim() && !modified.trim()}>
            Compare Code
          </Button>
        </div>
      </div>

      {/* Mobile Tab Swapper */}
      <div className="lg:hidden flex rounded-lg border border-input p-0.5 bg-background">
        <button
          onClick={() => setMobileTab("original")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "original" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Original (Old)
        </button>
        <button
          onClick={() => setMobileTab("modified")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "modified" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Modified (New)
        </button>
        <button
          onClick={() => setMobileTab("result")}
          disabled={!hasCompared}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
            mobileTab === "result" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Diff Result
        </button>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Text Input */}
        <Card className={cn("flex flex-col h-[380px] border-border", {
          "hidden lg:flex": mobileTab !== "original"
        })}>
          <div className="flex items-center px-4 py-3 border-b border-border bg-muted/20 select-none">
            <span className="text-sm font-bold flex items-center">
              <Icon name="Terminal" className="w-4 h-4 mr-2 text-primary" />
              <span>Original Text (Old)</span>
            </span>
          </div>
          <CardContent className="flex-1 p-0">
            <Textarea
              placeholder="Paste original file code or draft text here..."
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              mono
              className="w-full h-full border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 font-mono text-xs resize-none overflow-auto"
            />
          </CardContent>
        </Card>

        {/* Modified Text Input */}
        <Card className={cn("flex flex-col h-[380px] border-border", {
          "hidden lg:flex": mobileTab !== "modified"
        })}>
          <div className="flex items-center px-4 py-3 border-b border-border bg-muted/20 select-none">
            <span className="text-sm font-bold flex items-center">
              <Icon name="Terminal" className="w-4 h-4 mr-2 text-primary" />
              <span>Modified Text (New)</span>
            </span>
          </div>
          <CardContent className="flex-1 p-0">
            <Textarea
              placeholder="Paste modified file code or draft text here..."
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              mono
              className="w-full h-full border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 font-mono text-xs resize-none overflow-auto"
            />
          </CardContent>
        </Card>
      </div>

      {/* Comparative Diff Result Container */}
      {hasCompared && (
        <Card className={cn("border-border overflow-hidden animate-fade-in flex flex-col", {
          "hidden lg:flex": mobileTab !== "result"
        })}>
          <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-muted/15 select-none">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
              <Icon name="Terminal" className="w-4 h-4 mr-1.5 text-primary" />
              <span>Unified Difference Output</span>
            </span>
            <div className="flex space-x-4 text-[10px] text-muted-foreground">
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-emerald-500/25 mr-1" /> Added</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-rose-500/25 mr-1" /> Removed</span>
            </div>
          </div>

          <CardContent className="p-0 overflow-auto max-h-[500px] bg-card">
            {diffResults.length > 0 ? (
              <div className="font-mono text-xs divide-y divide-border/20 select-text">
                {diffResults.map((line, idx) => {
                  const isAdded = line.type === "added";
                  const isRemoved = line.type === "removed";
                  
                  return (
                    <div
                      key={idx}
                      className={cn("flex items-stretch hover:bg-muted/10 transition-colors w-full", {
                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400": isAdded,
                        "bg-rose-500/10 text-rose-600 dark:text-rose-400": isRemoved,
                        "text-muted-foreground": !isAdded && !isRemoved,
                      })}
                    >
                      {/* Original Line Number */}
                      <div className="w-10 sm:w-12 text-right py-1.5 pr-2.5 text-[10px] text-muted-foreground/60 border-r border-border/50 select-none bg-muted/5 shrink-0">
                        {line.originalLineNo || ""}
                      </div>
                      
                      {/* Modified Line Number */}
                      <div className="w-10 sm:w-12 text-right py-1.5 pr-2.5 text-[10px] text-muted-foreground/60 border-r border-border/50 select-none bg-muted/5 shrink-0">
                        {line.modifiedLineNo || ""}
                      </div>

                      {/* Diff Sign Indicator */}
                      <div className="w-6 text-center py-1.5 font-bold select-none shrink-0 border-r border-border/10">
                        {isAdded ? "+" : isRemoved ? "-" : " "}
                      </div>

                      {/* Line content */}
                      <pre className="flex-1 py-1.5 px-3 whitespace-pre overflow-x-auto text-[11px] leading-relaxed">
                        {line.content || " "}
                      </pre>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground select-none">
                No differences detected. Both text inputs match perfectly.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
