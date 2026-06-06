"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { SearchModal } from "./search-modal";
import { ApiKeyModal } from "./api-key-modal";

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isDarkTheme = document.documentElement.classList.contains("dark");
    setIsDark(isDarkTheme);

    const savedKey = localStorage.getItem("gemini_api_key");
    setHasApiKey(!!savedKey);

    const handleKeyUpdate = () => {
      const updatedKey = localStorage.getItem("gemini_api_key");
      setHasApiKey(!!updatedKey);
    };
    const handleOpenModal = () => setIsApiKeyOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    const handleThemeUpdated = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    window.addEventListener("api-key-updated", handleKeyUpdate);
    window.addEventListener("open-api-key-modal", handleOpenModal);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("theme-updated", handleThemeUpdated);
    return () => {
      window.removeEventListener("api-key-updated", handleKeyUpdate);
      window.removeEventListener("open-api-key-modal", handleOpenModal);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("theme-updated", handleThemeUpdated);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    window.dispatchEvent(new Event("theme-updated"));
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (pathname === "/") {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `/#${targetId}`);
      }
    } else {
      router.push(`/#${targetId}`);
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          COMMAND BAR — System-level navigation & status rail
          ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md">
        {/* Top micro-status strip */}
        <div className="hidden md:flex items-center justify-between px-6 py-[3px] border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-4 font-mono text-[9px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
            <span className="flex items-center gap-1.5">
              <span className="status-dot status-dot-live animate-signal-ping" />
              SYSTEM ONLINE
            </span>
            <span className="cmd-separator" />
            <span>v2.1.0</span>
            <span className="cmd-separator" />
            <span>CLIENT-SIDE SECURE</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[9px] tracking-widest text-muted-foreground/50 uppercase">
            <span>ZERO SERVER LOGGING</span>
            <span className="cmd-separator" />
            <span>OFFLINE CAPABLE</span>
          </div>
        </div>

        {/* Primary command bar */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between gap-4" style={{ height: "52px" }}>

          {/* LEFT — Logo + navigation */}
          <div className="flex items-center gap-0">
            {/* Logo */}
            <Link href="/" id="header-logo" className="flex items-center gap-2.5 group/logo mr-5">
              <div className="relative">
                <div className="absolute inset-0 rounded bg-gradient-to-br from-primary to-emerald-400 blur-sm opacity-30 group-hover/logo:opacity-60 transition-opacity duration-200" />
                <div className="relative flex items-center justify-center w-8 h-8 rounded border border-border bg-card group-hover/logo:border-primary/40 transition-colors duration-200">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                    <line x1="14" y1="4" x2="10" y2="20" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-sm tracking-tight text-foreground">
                  Dev<span className="text-primary group-hover/logo:text-emerald-400 transition-colors duration-150">ToolBox</span>
                </span>
                <span className="font-mono text-[8px] font-semibold tracking-widest text-muted-foreground/50 uppercase">Command Center</span>
              </div>
            </Link>

            {/* Separator */}
            <div className="cmd-separator hidden md:block mr-5" />

            {/* Desktop navigation — tactical section labels */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
              {[
                { href: "catalog", label: "Registry", icon: "Compass" },
                { href: "categories", label: "Categories", icon: "Layers" },
                { href: "faqs", label: "Intel FAQ", icon: "Info" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={`/#${item.href}`}
                  onClick={(e) => handleScroll(e, item.href)}
                  id={`nav-${item.href}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-100"
                >
                  <Icon name={item.icon} className="w-3 h-3" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* CENTER — Search input */}
          <button
            id="header-search-btn"
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 flex-1 max-w-xs px-3 py-1.5 rounded border border-border bg-secondary/60 hover:bg-secondary hover:border-primary/30 text-xs text-muted-foreground transition-all duration-100 cursor-pointer"
          >
            <Icon name="Search" className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left font-mono">Search tools...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold font-mono bg-muted border border-border rounded text-muted-foreground/70">
              Ctrl K
            </kbd>
          </button>

          {/* RIGHT — System controls cluster */}
          <div className="flex items-center gap-2">

            {/* Mobile search */}
            <button
              id="header-mobile-search"
              onClick={() => setIsSearchOpen(true)}
              className="flex sm:hidden items-center justify-center w-8 h-8 rounded border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Search tools"
            >
              <Icon name="Search" className="w-3.5 h-3.5" />
            </button>

            {/* AI status */}
            <button
              id="header-ai-status"
              onClick={() => setIsApiKeyOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-border bg-secondary/50 hover:bg-secondary hover:border-primary/30 text-xs font-mono font-semibold text-muted-foreground hover:text-foreground transition-all duration-100 cursor-pointer"
              title="Configure Gemini AI"
            >
              <Icon name="Sparkles" className="w-3 h-3 text-primary" />
              <span className={`status-dot ${hasApiKey ? "status-dot-live animate-signal-ping" : "status-dot-dead"}`} />
              <span className="hidden sm:inline tracking-wide text-[10px]">
                {hasApiKey ? "AI ACTIVE" : "AI SETUP"}
              </span>
            </button>

            {/* Theme toggle */}
            <button
              id="header-theme-toggle"
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              <Icon name={isDark ? "Sun" : "Moon"} className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu */}
            <button
              id="header-mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden items-center justify-center w-8 h-8 rounded border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Menu"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden sticky top-[52px] z-30 border-b border-border bg-card/95 backdrop-blur-md animate-panel-enter">
          <div className="container mx-auto px-4 py-4 space-y-1">
            <div className="pb-3 mb-3 border-b border-border/50">
              <span className="data-label">Navigation</span>
            </div>
            <nav className="flex flex-col gap-1">
              {[
                { href: "catalog", label: "Tool Registry", icon: "Compass" },
                { href: "categories", label: "Categories", icon: "Layers" },
                { href: "faqs", label: "Intel FAQ", icon: "Info" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={`/#${item.href}`}
                  onClick={(e) => handleScroll(e, item.href)}
                  className="rail-item"
                >
                  <Icon name={item.icon} className="w-3.5 h-3.5 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="pt-3 mt-3 border-t border-border/50">
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsApiKeyOpen(true); }}
                className="op-btn op-btn-ghost w-full justify-center"
              >
                <span className={`status-dot ${hasApiKey ? "status-dot-live" : "status-dot-dead"}`} />
                <span>{hasApiKey ? "Gemini AI Active" : "Configure Gemini AI"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} />
    </>
  );
}
