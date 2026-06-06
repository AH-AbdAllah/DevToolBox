"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { downloadAsFile, cn } from "@/lib/utils";

const SAMPLE_CSV = `id,name,role,active
1,Alice,Frontend Engineer,true
2,Bob,Backend Architect,false
3,Charlie,Product Manager,true
4,Diana,UX Researcher,true`;

export function CsvJsonClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [mode, setMode] = useState<"csv-to-json" | "json-to-csv">("csv-to-json");
  const [mobileTab, setMobileTab] = useState<"input" | "table" | "output">("input");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isCopied, copy } = useCopyToClipboard();

  // Zero-dependency CSV Parser
  const parseCSV = (text: string): { headers: string[]; rows: Record<string, string>[] } => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let cell = "";
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push(cell.trim());
        cell = "";
      } else if ((char === "\r" || char === "\n") && !inQuotes) {
        if (char === "\r" && nextChar === "\n") i++;
        row.push(cell.trim());
        lines.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
    
    if (cell || row.length > 0) {
      row.push(cell.trim());
      lines.push(row);
    }

    const cleanLines = lines.filter((r) => r.length > 0 && r.some((c) => c !== ""));
    if (cleanLines.length === 0) return { headers: [], rows: [] };

    const parsedHeaders = cleanLines[0];
    const parsedRows = cleanLines.slice(1).map((r) => {
      const record: Record<string, string> = {};
      parsedHeaders.forEach((h, idx) => {
        record[h] = r[idx] || "";
      });
      return record;
    });

    return { headers: parsedHeaders, rows: parsedRows };
  };

  // Convert array of objects to CSV string
  const convertJsonToCsvString = (jsonArr: any[]): string => {
    if (!Array.isArray(jsonArr) || jsonArr.length === 0) return "";
    const csvHeaders = Object.keys(jsonArr[0]);
    const csvLines = [csvHeaders.join(",")];
    
    jsonArr.forEach((row) => {
      const values = csvHeaders.map((h) => {
        const val = row[h] === null || row[h] === undefined ? "" : String(row[h]);
        if (val.includes(",") || val.includes('"') || val.includes("\n")) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvLines.push(values.join(","));
    });
    
    return csvLines.join("\n");
  };

  // Core parsing and conversion router
  const handleConvert = (val = input, targetMode = mode) => {
    if (!val.trim()) {
      setOutput("");
      setHeaders([]);
      setRows([]);
      setError(null);
      return;
    }

    try {
      if (targetMode === "csv-to-json") {
        const parsed = parseCSV(val);
        setHeaders(parsed.headers);
        setRows(parsed.rows);
        const jsonStr = JSON.stringify(parsed.rows, null, 2);
        setOutput(jsonStr);
        setError(null);
      } else {
        const parsedJson = JSON.parse(val);
        if (!Array.isArray(parsedJson)) {
          throw new Error("JSON must be an array of records (objects) to build a spreadsheet grid.");
        }
        const flatKeys = parsedJson.length > 0 ? Object.keys(parsedJson[0]) : [];
        setHeaders(flatKeys);
        
        // Flatten nested items into strings for simple cell view
        const stringifiedRows = parsedJson.map((item: any) => {
          const rec: Record<string, string> = {};
          flatKeys.forEach((key) => {
            rec[key] = typeof item[key] === "object" ? JSON.stringify(item[key]) : String(item[key]);
          });
          return rec;
        });

        setRows(stringifiedRows);
        const csvStr = convertJsonToCsvString(parsedJson);
        setOutput(csvStr);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
      setHeaders([]);
      setRows([]);
      setOutput("");
    }
  };

  // Triggered when editing a cell in the table grid
  const handleCellEdit = (rowIndex: number, headerKey: string, newValue: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][headerKey] = newValue;
    setRows(updatedRows);

    // Sync output
    try {
      if (mode === "csv-to-json") {
        const nextJson = JSON.stringify(updatedRows, null, 2);
        setOutput(nextJson);
      } else {
        const nextCsv = convertJsonToCsvString(updatedRows);
        setOutput(nextCsv);
      }
    } catch (err: any) {
      setError("Sync error during inline editing.");
    }
  };

  const handleModeChange = (nextMode: "csv-to-json" | "json-to-csv") => {
    setMode(nextMode);
    handleClear();
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setHeaders([]);
    setRows([]);
    setError(null);
    setFilterQuery("");
    setMobileTab("input");
  };

  const loadSample = () => {
    if (mode === "csv-to-json") {
      setInput(SAMPLE_CSV);
      handleConvert(SAMPLE_CSV, "csv-to-json");
    } else {
      const sampleJson = JSON.stringify(
        [
          { id: 1, name: "Alice", role: "Frontend Engineer", active: true },
          { id: 2, name: "Bob", role: "Backend Architect", active: false },
          { id: 3, name: "Charlie", role: "Product Manager", active: true },
        ],
        null,
        2
      );
      setInput(sampleJson);
      handleConvert(sampleJson, "json-to-csv");
    }
    setMobileTab("table"); // Switch to table grid view
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File is too large. Limits are set at 2MB to keep formatting fast.");
      setMobileTab("output");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInput(text);
      handleConvert(text);
      setMobileTab("table");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Filter rows based on search filter input
  const filteredRows = rows.filter((row) =>
    headers.some((header) => row[header]?.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Configuration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center space-x-6">
          <div className="inline-flex rounded-lg border border-input p-0.5 bg-background">
            <button
              onClick={() => handleModeChange("csv-to-json")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                mode === "csv-to-json"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CSV to JSON
            </button>
            <button
              onClick={() => handleModeChange("json-to-csv")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                mode === "json-to-csv"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              JSON to CSV
            </button>
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
            accept=".csv,.json,text/csv,application/json"
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
            mobileTab === "input" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Raw Input
        </button>
        <button
          onClick={() => setMobileTab("table")}
          disabled={rows.length === 0}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
            mobileTab === "table" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Spreadsheet Grid
        </button>
        <button
          onClick={() => setMobileTab("output")}
          disabled={!output}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
            mobileTab === "output" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Result Output
        </button>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Input (takes 1 col on desktop) */}
        <Card className={cn("flex flex-col h-[550px]", { "hidden lg:flex": mobileTab !== "input" })}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <span className="text-sm font-bold flex items-center">
              <Icon name="Terminal" className="w-4 h-4 mr-2 text-primary" />
              <span>Input Editor</span>
            </span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClear} title="Clear">
              <Icon name="Trash" className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
          <CardContent className="flex-grow p-0">
            <Textarea
              placeholder={
                mode === "csv-to-json"
                  ? "Paste CSV rows here (comma separated columns, first row as headers)..."
                  : "Paste JSON array of objects here..."
              }
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleConvert(e.target.value);
              }}
              mono
              className="w-full h-full border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 font-mono text-xs resize-none overflow-auto"
            />
          </CardContent>
        </Card>

        {/* Column 2: Interactive Spreadsheet Grid (takes 2 cols on desktop) */}
        <div className={cn("lg:col-span-2 flex flex-col space-y-6 h-[550px]", {
          "hidden lg:flex": mobileTab === "input" ? true : mobileTab === "output" ? true : false
        })}>
          {error ? (
            <Card className="h-full border-destructive/30 bg-destructive/5 flex items-center justify-center p-6 text-center">
              <CardContent className="space-y-3">
                <Icon name="AlertCircle" className="w-8 h-8 text-destructive mx-auto animate-pulse" />
                <h4 className="font-bold text-destructive">Parsing Error</h4>
                <p className="text-xs font-mono bg-destructive/10 border border-destructive/20 rounded p-3 max-w-md mx-auto">
                  {error}
                </p>
                <p className="text-xs text-muted-foreground">
                  Check if data conforms to selected mode. JSON must be an array of records. CSV columns should match.
                </p>
              </CardContent>
            </Card>
          ) : rows.length > 0 ? (
            <Card className="h-full border-border flex flex-col">
              {/* Spreadsheet tools header */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-border bg-muted/10 gap-3">
                <div className="text-xs text-muted-foreground font-semibold flex items-center">
                  <Icon name="Info" className="w-3.5 h-3.5 text-primary mr-1" />
                  <span>Double click any cell to edit details locally</span>
                </div>
                {/* Row search filter */}
                <div className="relative w-full sm:w-48">
                  <Icon name="Search" className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filter rows..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="h-8 pl-7 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Table Body Container */}
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-border border-collapse text-xs text-left">
                  <thead className="bg-muted/40 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2.5 font-bold border-b border-r border-border text-muted-foreground uppercase tracking-wider w-12 text-center">
                        #
                      </th>
                      {headers.map((h) => (
                        <th key={h} className="px-4 py-2.5 font-bold border-b border-r border-border text-muted-foreground uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredRows.map((rowItem, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2 border-r border-border text-center text-muted-foreground font-mono font-semibold select-none bg-muted/10">
                          {rowIndex + 1}
                        </td>
                        {headers.map((headerKey) => (
                          <td key={headerKey} className="px-3 py-1.5 border-r border-border p-0 min-w-[120px]">
                            <input
                              type="text"
                              value={rowItem[headerKey] || ""}
                              onChange={(e) => handleCellEdit(rowIndex, headerKey, e.target.value)}
                              className="w-full h-full bg-transparent px-1 border-0 outline-none text-foreground focus:bg-background focus:ring-1 focus:ring-ring rounded transition-colors"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="h-full border-border border-dashed flex items-center justify-center p-6 text-center">
              <CardContent className="space-y-2 text-muted-foreground">
                <Icon name="Shuffle" className="w-10 h-10 text-muted-foreground/35 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">Spreadsheet Grid Preview</h4>
                <p className="text-xs max-w-xs leading-relaxed">
                  Enter CSV columns or JSON arrays to unlock the editable spreadsheet view right inside this container.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Column 3: Output (only visible on mobileTab output OR lg desktop grids) */}
        {mobileTab === "output" && (
          <Card className="flex flex-col h-[550px] animate-fade-in lg:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
              <span className="text-sm font-bold flex items-center">
                <Icon name="Braces" className="w-4 h-4 mr-2 text-primary" />
                <span>Result Output</span>
              </span>
              {output && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      downloadAsFile(
                        output,
                        mode === "csv-to-json" ? "records.json" : "data.csv",
                        mode === "csv-to-json" ? "application/json" : "text/csv"
                      )
                    }
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
              <pre className="p-4 font-mono text-xs overflow-auto h-full w-full select-text whitespace-pre bg-card text-foreground">
                {output || <span className="text-muted-foreground/60">Formatted result output...</span>}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Persistent Desktop Output Panel (only rendered on desktop screen sizes) */}
      {output && !error && (
        <Card className="hidden lg:flex flex-col border-border max-h-[350px]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/15">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {mode === "csv-to-json" ? "Generated JSON Array" : "Generated CSV Content"}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  downloadAsFile(
                    output,
                    mode === "csv-to-json" ? "records.json" : "data.csv",
                    mode === "csv-to-json" ? "application/json" : "text/csv"
                  )
                }
                className="h-7 px-2"
              >
                <Icon name="Download" className="w-3 h-3 mr-1" />
                <span className="text-[10px]">Download</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => copy(output)} className="h-7 px-2">
                {isCopied ? (
                  <>
                    <Icon name="Check" className="w-3 h-3 mr-1 text-emerald-500" />
                    <span className="text-[10px] text-emerald-500 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Icon name="Copy" className="w-3 h-3 mr-1" />
                    <span className="text-[10px]">Copy Code</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          <CardContent className="p-0 overflow-auto">
            <pre className="p-4 font-mono text-[10px] whitespace-pre select-text overflow-auto h-[200px] bg-secondary/10 text-foreground">
              {output}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
