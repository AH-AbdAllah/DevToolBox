"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TOOLS } from "@/lib/tools-data";
import { Icon } from "@/components/ui/icon";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter tools based on query
  const filteredTools = query
    ? TOOLS.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query.toLowerCase()) ||
          tool.description.toLowerCase().includes(query.toLowerCase()) ||
          tool.keywords.some((kw) => kw.toLowerCase().includes(query.toLowerCase()))
      )
    : TOOLS.slice(0, 5); // Show popular/default tools when empty

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredTools.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % Math.max(1, filteredTools.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredTools[selectedIndex]) {
          router.push(filteredTools[selectedIndex].href);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div
        ref={containerRef}
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur-md animate-fade-in"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-border">
          <Icon name="Search" className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a tool name or keyword..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full h-12 bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground bg-muted border border-border rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredTools.length > 0 ? (
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                {query ? "Matching Tools" : "Popular Tools"}
              </div>
              {filteredTools.map((tool, index) => (
                <div
                  key={tool.id}
                  onClick={() => {
                    router.push(tool.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon
                    name={tool.icon}
                    className={`w-5 h-5 mr-3 ${
                      index === selectedIndex ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{tool.name}</div>
                    <div
                      className={`text-xs truncate ${
                        index === selectedIndex ? "text-primary-foreground/85" : "text-muted-foreground"
                      }`}
                    >
                      {tool.description}
                    </div>
                  </div>
                  <Icon
                    name="ChevronRight"
                    className={`w-4 h-4 ml-2 opacity-50 ${
                      index === selectedIndex ? "opacity-100" : ""
                    }`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No tools found matching your query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
