"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/ui/icon";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

interface PlayItem {
  id: number;
  grow: boolean;
  alignSelf: "self-auto" | "self-start" | "self-center" | "self-end" | "self-stretch";
  bg: string; // Tailwind color class name
  text: string; // Dark text or light text class
}

const COLOR_VARIANTS = [
  { name: "Indigo", bg: "bg-indigo-500", text: "text-white" },
  { name: "Violet", bg: "bg-violet-500", text: "text-white" },
  { name: "Rose", bg: "bg-rose-500", text: "text-white" },
  { name: "Emerald", bg: "bg-emerald-500", text: "text-emerald-950" },
  { name: "Amber", bg: "bg-amber-500", text: "text-amber-950" },
  { name: "Sky", bg: "bg-sky-500", text: "text-sky-950" },
];

export function TailwindPlaygroundClient() {
  const [items, setItems] = useState<PlayItem[]>([
    { id: 1, grow: false, alignSelf: "self-auto", bg: "bg-indigo-500", text: "text-white" },
    { id: 2, grow: false, alignSelf: "self-auto", bg: "bg-violet-500", text: "text-white" },
    { id: 3, grow: false, alignSelf: "self-auto", bg: "bg-rose-500", text: "text-white" },
  ]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Layout Properties
  const [layout, setLayout] = useState<"flex" | "grid">("flex");
  const [flexDir, setFlexDir] = useState("flex-row");
  const [flexWrap, setFlexWrap] = useState("flex-wrap");
  const [justifyContent, setJustifyContent] = useState("justify-start");
  const [alignItems, setAlignItems] = useState("items-stretch");

  // Grid Properties
  const [gridCols, setGridCols] = useState("grid-cols-3");

  // General Properties
  const [gap, setGap] = useState("gap-4");

  const [generatedHtml, setGeneratedHtml] = useState("");
  const { isCopied, copy } = useCopyToClipboard();

  // Add Item to canvas
  const addItem = () => {
    if (items.length >= 12) return;
    const color = COLOR_VARIANTS[(items.length) % COLOR_VARIANTS.length];
    setItems([
      ...items,
      {
        id: items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1,
        grow: false,
        alignSelf: "self-auto",
        bg: color.bg,
        text: color.text,
      },
    ]);
  };

  // Remove Item from canvas
  const removeItem = () => {
    if (items.length <= 1) return;
    setItems(items.slice(0, -1));
    setSelectedIdx(null);
  };

  // Item customization edits
  const updateItemProperty = (index: number, key: keyof PlayItem, value: any) => {
    const nextItems = [...items];
    nextItems[index] = {
      ...nextItems[index],
      [key]: value,
    };
    setItems(nextItems);
  };

  // Generate output CSS / HTML classes
  useEffect(() => {
    const containerClasses = cn(
      layout === "flex" ? "flex" : "grid",
      layout === "flex" ? `${flexDir} ${flexWrap} ${justifyContent} ${alignItems}` : `${gridCols} ${alignItems}`,
      gap
    );

    const childElements = items
      .map((item) => {
        const itemClasses = cn(
          "p-4 rounded-lg flex items-center justify-center font-bold font-mono shadow-sm",
          item.bg,
          item.text,
          item.grow ? "flex-grow" : "",
          item.alignSelf !== "self-auto" ? item.alignSelf : ""
        );
        return `  <div class="${itemClasses}">\n    Item ${item.id}\n  </div>`;
      })
      .join("\n");

    const markup = `<div class="${containerClasses}">\n${childElements}\n</div>`;
    setGeneratedHtml(markup);
  }, [layout, flexDir, flexWrap, justifyContent, alignItems, gridCols, gap, items]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Settings Column */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-border">
          <CardContent className="p-5 space-y-5">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Container Options
            </h3>

            {/* Layout type selector */}
            <div className="inline-flex rounded-lg border border-input p-0.5 bg-background w-full">
              <button
                onClick={() => setLayout("flex")}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  layout === "flex"
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Flexbox
              </button>
              <button
                onClick={() => setLayout("grid")}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  layout === "grid"
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Grid Layout
              </button>
            </div>

            <div className="border-t border-border/50" />

            {/* Flex specific configurations */}
            {layout === "flex" && (
              <div className="space-y-4 animate-fade-in text-xs">
                {/* Flex Direction */}
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground">Direction</span>
                  <select
                    value={flexDir}
                    onChange={(e) => setFlexDir(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="flex-row">flex-row (Horizontal)</option>
                    <option value="flex-row-reverse">flex-row-reverse</option>
                    <option value="flex-col">flex-col (Vertical)</option>
                    <option value="flex-col-reverse">flex-col-reverse</option>
                  </select>
                </div>

                {/* Flex Wrap */}
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground">Wrap</span>
                  <select
                    value={flexWrap}
                    onChange={(e) => setFlexWrap(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="flex-wrap">flex-wrap</option>
                    <option value="flex-nowrap">flex-nowrap</option>
                  </select>
                </div>

                {/* Justify Content */}
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground">Justify Content (Main Axis)</span>
                  <select
                    value={justifyContent}
                    onChange={(e) => setJustifyContent(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="justify-start">justify-start</option>
                    <option value="justify-center">justify-center</option>
                    <option value="justify-end">justify-end</option>
                    <option value="justify-between">justify-between</option>
                    <option value="justify-around">justify-around</option>
                    <option value="justify-evenly">justify-evenly</option>
                  </select>
                </div>
              </div>
            )}

            {/* Grid specific configurations */}
            {layout === "grid" && (
              <div className="space-y-4 animate-fade-in text-xs">
                {/* Grid Columns */}
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground">Columns</span>
                  <select
                    value={gridCols}
                    onChange={(e) => setGridCols(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="grid-cols-1">grid-cols-1</option>
                    <option value="grid-cols-2">grid-cols-2</option>
                    <option value="grid-cols-3">grid-cols-3</option>
                    <option value="grid-cols-4">grid-cols-4</option>
                    <option value="grid-cols-6">grid-cols-6</option>
                    <option value="grid-cols-8">grid-cols-8</option>
                    <option value="grid-cols-12">grid-cols-12</option>
                  </select>
                </div>
              </div>
            )}

            {/* General Properties */}
            <div className="space-y-4 text-xs">
              {/* Align Items */}
              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground">Align Items (Cross Axis)</span>
                <select
                  value={alignItems}
                  onChange={(e) => setAlignItems(e.target.value)}
                  className="w-full h-8 rounded-lg border border-input bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="items-stretch">items-stretch</option>
                  <option value="items-start">items-start</option>
                  <option value="items-center">items-center</option>
                  <option value="items-end">items-end</option>
                  <option value="items-baseline">items-baseline</option>
                </select>
              </div>

              {/* Spacing Gap */}
              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground">Gap (Spacing)</span>
                <select
                  value={gap}
                  onChange={(e) => setGap(e.target.value)}
                  className="w-full h-8 rounded-lg border border-input bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="gap-0">gap-0 (0px)</option>
                  <option value="gap-1">gap-1 (4px)</option>
                  <option value="gap-2">gap-2 (8px)</option>
                  <option value="gap-3">gap-3 (12px)</option>
                  <option value="gap-4">gap-4 (16px)</option>
                  <option value="gap-6">gap-6 (24px)</option>
                  <option value="gap-8">gap-8 (32px)</option>
                  <option value="gap-12">gap-12 (48px)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-border/50" />

            {/* Add / Remove Mock items */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={removeItem} className="flex-1" disabled={items.length <= 1}>
                - Remove
              </Button>
              <Button size="sm" onClick={addItem} className="flex-1" disabled={items.length >= 12}>
                + Add Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Selected Item configuration panel */}
        {selectedIdx !== null && items[selectedIdx] && (
          <Card className="border-primary/40 bg-primary/5 animate-fade-in text-xs">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Item {items[selectedIdx].id} Settings</span>
                <button
                  onClick={() => setSelectedIdx(null)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Icon name="X" className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="border-t border-primary/20" />

              {layout === "flex" && (
                <Switch
                  label="flex-grow (Fill Space)"
                  checked={items[selectedIdx].grow}
                  onChange={(e) => updateItemProperty(selectedIdx, "grow", e.target.checked)}
                />
              )}

              {/* Self Align */}
              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground">Align Self</span>
                <select
                  value={items[selectedIdx].alignSelf}
                  onChange={(e) => updateItemProperty(selectedIdx, "alignSelf", e.target.value)}
                  className="w-full h-8 rounded-lg border border-input bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="self-auto">self-auto</option>
                  <option value="self-start">self-start</option>
                  <option value="self-center">self-center</option>
                  <option value="self-end">self-end</option>
                  <option value="self-stretch">self-stretch</option>
                </select>
              </div>

              {/* Color customization */}
              <div className="space-y-1.5">
                <span className="font-semibold text-muted-foreground">Color Variant</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {COLOR_VARIANTS.map((col) => (
                    <button
                      key={col.bg}
                      onClick={() => {
                        updateItemProperty(selectedIdx, "bg", col.bg);
                        updateItemProperty(selectedIdx, "text", col.text);
                      }}
                      className={cn(
                        "h-6 rounded border text-[9px] font-semibold flex items-center justify-center transition-all cursor-pointer",
                        col.bg,
                        col.text,
                        items[selectedIdx].bg === col.bg ? "ring-2 ring-primary ring-offset-1" : "border-border"
                      )}
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Visual Canvas and Code panel (takes 3 cols on desktop) */}
      <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
        {/* Visual Canvas Panel */}
        <Card className="border-border flex-grow min-h-[300px] flex flex-col">
          <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-muted/10 select-none">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
              <Icon name="Palette" className="w-4 h-4 mr-1.5 text-primary animate-pulse" />
              <span>Interactive Visual Canvas</span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              Tip: Click any box to configure grow, alignment, or color rules
            </span>
          </div>

          <CardContent className="flex-grow p-6 relative flex flex-col justify-center bg-secondary/5">
            {/* Grid Line Backdrop Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

            {/* The Actual Layout Box Container */}
            <div
              className={cn(
                "transition-all duration-300 w-full p-4 rounded-xl border border-border bg-card/40 relative z-10",
                layout === "flex" ? "flex" : "grid",
                layout === "flex" ? `${flexDir} ${flexWrap} ${justifyContent} ${alignItems}` : `${gridCols} ${alignItems}`,
                gap
              )}
            >
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedIdx(idx === selectedIdx ? null : idx)}
                  className={cn(
                    "relative p-6 rounded-lg text-center cursor-pointer transition-all duration-200 flex items-center justify-center font-mono font-bold text-sm shadow shadow-black/5 min-w-[70px] select-none hover:scale-102 hover:shadow-md",
                    item.bg,
                    item.text,
                    item.grow ? "flex-grow" : "",
                    item.alignSelf !== "self-auto" ? item.alignSelf : "",
                    selectedIdx === idx ? "ring-4 ring-primary ring-offset-2 scale-103" : ""
                  )}
                  style={{ minHeight: layout === "flex" && flexDir.includes("col") ? "70px" : "auto" }}
                >
                  <span>Item {item.id}</span>
                  {selectedIdx === idx && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center border border-white shadow-sm">
                      <Icon name="Settings" className="w-2.5 h-2.5 text-primary-foreground animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Copyable HTML Code Output */}
        <Card className="border-border">
          <div className="flex justify-between items-center px-4 py-2 border-b border-border bg-muted/15 select-none">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Generated HTML Code
            </span>
            <Button variant="outline" size="sm" onClick={() => copy(generatedHtml)} className="h-7 px-2">
              {isCopied ? (
                <>
                  <Icon name="Check" className="w-3 h-3 mr-1 text-emerald-500" />
                  <span className="text-[10px] text-emerald-500 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Icon name="Copy" className="w-3 h-3 mr-1" />
                  <span className="text-[10px]">Copy HTML</span>
                </>
              )}
            </Button>
          </div>
          <CardContent className="p-0">
            <pre className="p-4 font-mono text-[10px] whitespace-pre overflow-auto max-h-[160px] bg-secondary/15 text-foreground select-text">
              {generatedHtml}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
