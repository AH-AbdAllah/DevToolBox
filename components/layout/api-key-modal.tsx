"use client";

import { useEffect, useState, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load key from localStorage on open
  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem("gemini_api_key") || "";
      setApiKey(savedKey);
      setIsSaved(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("gemini_api_key", apiKey.trim());
    setIsSaved(true);
    // Dispatch event to notify header and components
    window.dispatchEvent(new Event("api-key-updated"));
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClear = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    window.dispatchEvent(new Event("api-key-updated"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl p-6 space-y-6 animate-fade-in relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold flex items-center text-foreground">
              <Icon name="Key" className="w-5 h-5 mr-2 text-primary" />
              <span>Configure AI Gemini Key</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enable advanced intelligence tools. Your key is stored locally in your browser and sent directly to Google APIs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Icon name="X" className="w-4 h-4" />
          </button>
        </div>

        {/* Input Block */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground" htmlFor="api-key-input">
            Gemini API Key
          </label>
          <div className="relative flex items-center">
            <input
              id="api-key-input"
              ref={inputRef}
              type={showKey ? "text" : "password"}
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full h-10 pl-3 pr-10 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all font-mono"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={showKey ? "Hide Key" : "Show Key"}
            >
              <Icon name={showKey ? "Sun" : "Moon"} className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center font-medium"
            >
              <span>Get a free Gemini API Key</span>
              <Icon name="ExternalLink" className="w-3 h-3 ml-1" />
            </a>
            {apiKey && (
              <button
                onClick={handleClear}
                className="text-destructive hover:underline font-medium cursor-pointer"
              >
                Clear Saved Key
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-3 bg-secondary/15 border border-border/50 rounded-lg text-[11px] text-muted-foreground leading-relaxed space-y-1.5">
          <div className="flex items-center text-foreground font-semibold">
            <Icon name="Lock" className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
            <span>Zero Server Storing</span>
          </div>
          <p>
            Your key is never sent to our servers. All AI generations are client-side integrations calling <code>https://generativelanguage.googleapis.com</code> directly.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaved}>
            {isSaved ? (
              <span className="flex items-center">
                <Icon name="Check" className="w-4 h-4 mr-1 text-emerald-500" /> Saved!
              </span>
            ) : (
              "Save Key"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
