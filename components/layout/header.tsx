"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { SearchModal } from "./search-modal";

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Sync theme status on component mount
  useEffect(() => {
    const isDarkTheme = document.documentElement.classList.contains("dark");
    setIsDark(isDarkTheme);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 shadow-md shadow-primary/20">
                <Icon name="Cpu" className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground">
                DevToolBox
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
          </div>
        </div>
      )}

      {/* Cmd+K Search modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
