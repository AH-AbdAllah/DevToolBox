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

  // Sync theme status and API key status on mount
  useEffect(() => {
    const isDarkTheme = document.documentElement.classList.contains("dark");
    setIsDark(isDarkTheme);

    const savedKey = localStorage.getItem("gemini_api_key");
    setHasApiKey(!!savedKey);

    const handleKeyUpdate = () => {
      const updatedKey = localStorage.getItem("gemini_api_key");
      setHasApiKey(!!updatedKey);
    };

    const handleOpenModal = () => {
      setIsApiKeyOpen(true);
    };

    window.addEventListener("api-key-updated", handleKeyUpdate);
    window.addEventListener("open-api-key-modal", handleOpenModal);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("api-key-updated", handleKeyUpdate);
      window.removeEventListener("open-api-key-modal", handleOpenModal);
      window.removeEventListener("keydown", handleKeyDown);
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
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2.5 group/logo">
              <div className="relative">
                {/* Outer glowing backdrop */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-primary to-emerald-500 blur-sm opacity-40 group-hover/logo:opacity-80 transition-opacity duration-300" />
                {/* Inner icon canvas */}
                <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-card border border-border group-hover/logo:border-primary/50 transition-colors duration-300 shadow-sm">
                  {/* Glowing core code block SVG */}
                  <svg
                    className="w-4.5 h-4.5 text-primary group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-transform duration-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                    <line x1="14" y1="4" x2="10" y2="20" className="text-emerald-400/80" />
                  </svg>
                </div>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                Dev<span className="text-primary group-hover/logo:text-emerald-400 transition-colors duration-200">ToolBox</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/#catalog"
                onClick={(e) => handleScroll(e, "catalog")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                All Tools
              </Link>
              <Link
                href="/#categories"
                onClick={(e) => handleScroll(e, "categories")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/#faqs"
                onClick={(e) => handleScroll(e, "faqs")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQs
              </Link>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Input Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center w-40 lg:w-48 px-3 py-1.5 rounded-lg border border-input bg-background/50 text-xs text-muted-foreground hover:bg-background hover:text-foreground transition-all duration-200 cursor-pointer"
            >
              <Icon name="Search" className="w-4 h-4 mr-2" />
              <span className="flex-1 text-left">Search tools...</span>
              <kbd className="hidden sm:inline-block px-1 py-0.5 text-[9px] font-semibold bg-muted border border-border rounded">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon Only */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex sm:hidden p-2 rounded-lg border border-input hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Search Tools"
            >
              <Icon name="Search" className="w-4 h-4" />
            </button>

            {/* AI API Status Button */}
            <button
              onClick={() => setIsApiKeyOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-input bg-background/50 hover:bg-background transition-colors text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              title="Configure Gemini API Key"
            >
              <Icon name="Sparkles" className="w-3.5 h-3.5 text-primary" />
              <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? "bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" : "bg-muted-foreground/40"}`} />
              <span className="hidden sm:inline">{hasApiKey ? "AI Active" : "Setup AI"}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-input hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? (
                <Icon name="Sun" className="w-4 h-4" />
              ) : (
                <Icon name="Moon" className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden p-2 rounded-lg border border-input hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? (
                <Icon name="X" className="w-4 h-4" />
              ) : (
                <Icon name="Menu" className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Collapsible Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card/95 backdrop-blur-md sticky top-16 z-30">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/#catalog"
                onClick={(e) => handleScroll(e, "catalog")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 border-b border-border/40"
              >
                All Tools
              </Link>
              <Link
                href="/#categories"
                onClick={(e) => handleScroll(e, "categories")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 border-b border-border/40"
              >
                Categories
              </Link>
              <Link
                href="/#faqs"
                onClick={(e) => handleScroll(e, "faqs")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5"
              >
                FAQs
              </Link>
            </nav>

            <div className="border-t border-border/50 pt-4">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsApiKeyOpen(true);
                }}
                className="flex items-center justify-center w-full space-x-2 px-3 py-2 rounded-lg border border-input bg-background/50 text-xs text-muted-foreground hover:bg-background transition-colors cursor-pointer"
              >
                <span className={`w-2 h-2 rounded-full ${hasApiKey ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"}`} />
                <span className="font-semibold">{hasApiKey ? "Gemini AI Active" : "Configure AI Gemini Key"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cmd+K Search modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Gemini API settings modal */}
      <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} />
    </>
  );
}
